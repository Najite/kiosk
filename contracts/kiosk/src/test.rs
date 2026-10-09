#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env, String, Vec};

fn create_token_contract<'a>(
    env: &Env,
    admin: &Address,
) -> (Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let contract = env.register_stellar_asset_contract_v2(admin.clone());
    let addr = contract.address();
    let client = token::Client::new(env, &addr);
    let admin_client = token::StellarAssetClient::new(env, &addr);
    (addr, client, admin_client)
}

#[test]
fn test_initialize_and_default_policy() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let creator = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    client.initialize(&owner, &500, &creator, &100, &splits);

    let policy = client.get_default_policy();
    assert_eq!(policy.royalty_bps, 500);
    assert_eq!(policy.royalty_recipient, creator);
    assert_eq!(policy.min_floor_price, 100);
    assert_eq!(policy.upstream_splits.len(), 0);
    assert_eq!(client.get_owner(), owner);

    // get_policy with None returns default policy
    let effective = client.get_policy(&None);
    assert_eq!(effective.royalty_bps, 500);
}

#[test]
fn test_set_asset_policy_override() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let default_creator = Address::generate(&env);
    let asset_creator = Address::generate(&env);
    let asset_contract = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    // Initialize with default 5% royalty
    client.initialize(&owner, &500, &default_creator, &100, &splits);

    // Creator sets custom 10% royalty for specific asset
    client.set_asset_policy(
        &asset_creator,
        &asset_contract,
        &1_000,
        &asset_creator,
        &250,
        &splits,
    );

    // Query asset policy directly
    let asset_policy = client.get_asset_policy(&asset_contract);
    assert_eq!(asset_policy.royalty_bps, 1_000);
    assert_eq!(asset_policy.royalty_recipient, asset_creator);
    assert_eq!(asset_policy.min_floor_price, 250);

    // Query effective policy
    let effective = client.get_policy(&Some(asset_contract));
    assert_eq!(effective.royalty_bps, 1_000);
    assert_eq!(effective.min_floor_price, 250);
}

#[test]
fn test_place_and_vault_custody() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &500, &owner, &50, &splits);

    // Deploy asset token contract & mint 5 passes to seller
    let token_admin = Address::generate(&env);
    let (asset_addr, asset_client, asset_admin) = create_token_contract(&env, &token_admin);
    asset_admin.mint(&seller, &5);
    assert_eq!(asset_client.balance(&seller), 5);

    // Seller places 2 passes into Kiosk vault
    let item_id = client.place(
        &seller,
        &asset_addr,
        &2,
        &String::from_str(&env, "Soroban Pass"),
        &String::from_str(&env, "Access Pass"),
        &String::from_str(&env, "Pass"),
    );

    assert_eq!(item_id, 1);
    assert_eq!(client.get_item_count(), 1);

    // Verify token custody: 2 tokens pulled into contract address!
    assert_eq!(asset_client.balance(&seller), 3);
    assert_eq!(asset_client.balance(&contract_id), 2);

    let item = client.get_item(&item_id);
    assert_eq!(item.id, 1);
    assert_eq!(item.seller, seller);
    assert_eq!(item.asset_contract, asset_addr);
    assert_eq!(item.asset_amount, 2);
    assert_eq!(item.price, 0);
    assert!(!item.is_listed);
    assert_eq!(item.status, ItemStatus::Placed);
}

#[test]
fn test_list_and_update_price() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &500, &owner, &50, &splits);

    let token_admin = Address::generate(&env);
    let (asset_addr, _, asset_admin) = create_token_contract(&env, &token_admin);
    let (payment_addr, _, _) = create_token_contract(&env, &token_admin);
    asset_admin.mint(&seller, &1);

    let item_id = client.place(
        &seller,
        &asset_addr,
        &1,
        &String::from_str(&env, "Dev Pass"),
        &String::from_str(&env, "Desc"),
        &String::from_str(&env, "Pass"),
    );

    // List item for 150 stroops of payment_addr
    client.list(&seller, &item_id, &150, &payment_addr);

    let item = client.get_item(&item_id);
    assert!(item.is_listed);
    assert_eq!(item.status, ItemStatus::Listed);
    assert_eq!(item.price, 150);
    assert_eq!(item.payment_token, payment_addr);

    // Update price
    client.update_price(&seller, &item_id, &200);
    let updated = client.get_item(&item_id);
    assert_eq!(updated.price, 200);
}

#[test]
fn test_delist_and_withdraw_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &500, &owner, &50, &splits);

    let token_admin = Address::generate(&env);
    let (asset_addr, asset_client, asset_admin) = create_token_contract(&env, &token_admin);
    let (payment_addr, _, _) = create_token_contract(&env, &token_admin);
    asset_admin.mint(&seller, &1);

    let item_id = client.place(
        &seller,
        &asset_addr,
        &1,
        &String::from_str(&env, "Pass #2"),
        &String::from_str(&env, "Desc"),
        &String::from_str(&env, "License"),
    );

    client.list(&seller, &item_id, &100, &payment_addr);

    // Cannot withdraw while listed
    let withdraw_fail = client.try_withdraw(&seller, &item_id);
    assert_eq!(withdraw_fail, Err(Ok(KioskError::CannotWithdrawListed)));

    // Delist back to Placed status
    client.delist(&seller, &item_id);
    let item = client.get_item(&item_id);
    assert!(!item.is_listed);
    assert_eq!(item.status, ItemStatus::Placed);

    // Now withdraw asset back to seller's wallet
    client.withdraw(&seller, &item_id);

    // Asset returned to seller!
    assert_eq!(asset_client.balance(&seller), 1);
    assert_eq!(asset_client.balance(&contract_id), 0);

    // Storage record removed
    let query_res = client.try_get_item(&item_id);
    assert_eq!(query_res, Err(Ok(KioskError::ItemNotFound)));
}

#[test]
fn test_place_and_list_atomic() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &500, &owner, &50, &splits);

    let token_admin = Address::generate(&env);
    let (asset_addr, asset_client, asset_admin) = create_token_contract(&env, &token_admin);
    let (payment_addr, _, _) = create_token_contract(&env, &token_admin);
    asset_admin.mint(&seller, &10);

    let item_id = client.place_and_list(
        &seller,
        &asset_addr,
        &3,
        &payment_addr,
        &250,
        &String::from_str(&env, "Atomic Pass"),
        &String::from_str(&env, "Instant Listing"),
        &String::from_str(&env, "Pass"),
    );

    assert_eq!(item_id, 1);
    assert_eq!(asset_client.balance(&seller), 7);
    assert_eq!(asset_client.balance(&contract_id), 3);

    let item = client.get_item(&item_id);
    assert!(item.is_listed);
    assert_eq!(item.status, ItemStatus::Listed);
    assert_eq!(item.price, 250);
    assert_eq!(item.payment_token, payment_addr);
}

#[test]
fn test_purchase_splits_and_asset_delivery() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let creator = Address::generate(&env);
    let upstream = Address::generate(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let mut splits: Vec<UpstreamSplit> = Vec::new(&env);
    splits.push_back(UpstreamSplit {
        recipient: upstream.clone(),
        share_bps: 250, // 2.5%
    });

    // 500 bps = 5% royalty, floor = 100
    client.initialize(&owner, &500, &creator, &100, &splits);

    // Create payment token (e.g. XLM SAC) & tradable asset
    let token_admin = Address::generate(&env);
    let (payment_addr, payment_client, payment_admin) = create_token_contract(&env, &token_admin);
    let (asset_addr, asset_client, asset_admin) = create_token_contract(&env, &token_admin);

    // Mint payment to buyer (10,000 stroops)
    payment_admin.mint(&buyer, &10_000);

    // Mint asset to seller (1 NFT/pass)
    asset_admin.mint(&seller, &1);

    // Seller places and lists asset for 1,000 stroops
    let item_id = client.place_and_list(
        &seller,
        &asset_addr,
        &1,
        &payment_addr,
        &1_000,
        &String::from_str(&env, "Exclusive License"),
        &String::from_str(&env, "Full commercial license"),
        &String::from_str(&env, "License"),
    );

    // Before purchase: contract holds asset
    assert_eq!(asset_client.balance(&contract_id), 1);
    assert_eq!(asset_client.balance(&buyer), 0);

    // Execute purchase
    client.purchase(&buyer, &item_id);

    // 1. Payment distribution verification:
    // price = 1000
    // royalty = 5% of 1000 = 50
    // upstream = 2.5% of 1000 = 25
    // seller net = 1000 - 50 - 25 = 925
    // buyer payment balance = 10_000 - 1000 = 9_000
    assert_eq!(payment_client.balance(&buyer), 9_000);
    assert_eq!(payment_client.balance(&seller), 925);
    assert_eq!(payment_client.balance(&creator), 50);
    assert_eq!(payment_client.balance(&upstream), 25);

    // 2. CRITICAL ASSET CUSTODY VERIFICATION:
    // Escrowed asset was delivered directly into buyer's wallet!
    assert_eq!(asset_client.balance(&contract_id), 0);
    assert_eq!(asset_client.balance(&buyer), 1);

    // 3. State verification:
    let item = client.get_item(&item_id);
    assert!(!item.is_listed);
    assert_eq!(item.status, ItemStatus::Sold);
    assert_eq!(item.seller, buyer); // New owner
}

#[test]
fn test_purchase_already_sold_or_delisted_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &0, &owner, &50, &splits);

    let token_admin = Address::generate(&env);
    let (payment_addr, _, payment_admin) = create_token_contract(&env, &token_admin);
    let (asset_addr, _, asset_admin) = create_token_contract(&env, &token_admin);
    payment_admin.mint(&buyer, &10_000);
    asset_admin.mint(&seller, &1);

    let item_id = client.place_and_list(
        &seller,
        &asset_addr,
        &1,
        &payment_addr,
        &100,
        &String::from_str(&env, "Item 1"),
        &String::from_str(&env, "Desc"),
        &String::from_str(&env, "License"),
    );

    // Delist item
    client.delist(&seller, &item_id);

    // Attempting to buy a delisted item fails with ItemNotListed
    let res = client.try_purchase(&buyer, &item_id);
    assert_eq!(res, Err(Ok(KioskError::ItemNotListed)));
}

#[test]
fn test_place_below_floor_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &500, &owner, &500, &splits); // Floor is 500

    let token_admin = Address::generate(&env);
    let (asset_addr, _, asset_admin) = create_token_contract(&env, &token_admin);
    let (payment_addr, _, _) = create_token_contract(&env, &token_admin);
    asset_admin.mint(&seller, &1);

    let res = client.try_place_and_list(
        &seller,
        &asset_addr,
        &1,
        &payment_addr,
        &499, // Below floor
        &String::from_str(&env, "Cheap Item"),
        &String::from_str(&env, "Desc"),
        &String::from_str(&env, "Badge"),
    );
    assert_eq!(res, Err(Ok(KioskError::PriceBelowFloor)));
}

#[test]
fn test_unauthorized_delist_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let attacker = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &0, &owner, &10, &splits);

    let token_admin = Address::generate(&env);
    let (asset_addr, _, asset_admin) = create_token_contract(&env, &token_admin);
    let (payment_addr, _, _) = create_token_contract(&env, &token_admin);
    asset_admin.mint(&seller, &1);

    let item_id = client.place_and_list(
        &seller,
        &asset_addr,
        &1,
        &payment_addr,
        &100,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &String::from_str(&env, "Pass"),
    );

    // Attacker tries to delist seller's item
    let res = client.try_delist(&attacker, &item_id);
    assert_eq!(res, Err(Ok(KioskError::Unauthorized)));
}

#[test]
fn test_unauthorized_withdraw_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let attacker = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &0, &owner, &10, &splits);

    let token_admin = Address::generate(&env);
    let (asset_addr, _, asset_admin) = create_token_contract(&env, &token_admin);
    asset_admin.mint(&seller, &1);

    let item_id = client.place(
        &seller,
        &asset_addr,
        &1,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &String::from_str(&env, "Pass"),
    );

    // Attacker tries to withdraw seller's escrowed asset
    let res = client.try_withdraw(&attacker, &item_id);
    assert_eq!(res, Err(Ok(KioskError::Unauthorized)));
}

#[test]
fn test_unauthorized_set_policy_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let attacker = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &500, &owner, &100, &splits);

    let res = client.try_set_policy(&attacker, &1000, &attacker, &50, &splits);
    assert_eq!(res, Err(Ok(KioskError::Unauthorized)));
}

#[test]
fn test_invalid_bps_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    let res = client.try_initialize(&owner, &10_001, &owner, &100, &splits);
    assert_eq!(res, Err(Ok(KioskError::InvalidBps)));
}

#[test]
fn test_invalid_place_amount_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let asset = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    client.initialize(&owner, &500, &owner, &50, &splits);

    let res = client.try_place(
        &seller,
        &asset,
        &0, // Zero amount
        &String::from_str(&env, "Invalid"),
        &String::from_str(&env, "Desc"),
        &String::from_str(&env, "Pass"),
    );
    assert_eq!(res, Err(Ok(KioskError::InvalidAmount)));
}

#[test]
fn test_already_initialized_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    client.initialize(&owner, &500, &owner, &100, &splits);

    let res = client.try_initialize(&owner, &500, &owner, &100, &splits);
    assert_eq!(res, Err(Ok(KioskError::AlreadyInitialized)));
}

#[test]
fn test_kiosk_custom_asset_deposit_and_withdrawal() {
    let env = Env::default();
    env.mock_all_auths();

    let kiosk_id = env.register_contract(None, KioskContract);
    let kiosk_client = KioskContractClient::new(&env, &kiosk_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);
    kiosk_client.initialize(&owner, &500, &owner, &100, &splits);

    // Deploy custom KioskAssetContract (SEP-0041 Token)
    let asset_id = env.register_contract(None, kiosk_asset::KioskAssetContract);
    let asset_client = kiosk_asset::KioskAssetContractClient::new(&env, &asset_id);

    let asset_admin = Address::generate(&env);
    asset_client.initialize(
        &asset_admin,
        &0,
        &String::from_str(&env, "Axon Enterprise License"),
        &String::from_str(&env, "AXON"),
    );

    // Mint 1 asset token to seller
    asset_client.mint(&seller, &1);
    assert_eq!(asset_client.balance(&seller), 1);
    assert_eq!(asset_client.balance(&kiosk_id), 0);

    // Place asset into Kiosk
    let item_id = kiosk_client.place(
        &seller,
        &asset_id,
        &1,
        &String::from_str(&env, "Axon License #001"),
        &String::from_str(&env, "Perpetual License"),
        &String::from_str(&env, "license"),
    );

    // Asset has moved into Kiosk custody!
    assert_eq!(asset_client.balance(&seller), 0);
    assert_eq!(asset_client.balance(&kiosk_id), 1);

    // Seller withdraws from Kiosk
    kiosk_client.withdraw(&seller, &item_id);

    // Asset has returned to seller wallet!
    assert_eq!(asset_client.balance(&seller), 1);
    assert_eq!(asset_client.balance(&kiosk_id), 0);
}

#[test]
fn test_kiosk_custom_asset_purchase_delivery() {
    let env = Env::default();
    env.mock_all_auths();

    let kiosk_id = env.register_contract(None, KioskContract);
    let kiosk_client = KioskContractClient::new(&env, &kiosk_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let royalty_recipient = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    kiosk_client.initialize(&owner, &1000, &royalty_recipient, &100, &splits);

    // 1. Create custom asset token
    let asset_id = env.register_contract(None, kiosk_asset::KioskAssetContract);
    let asset_client = kiosk_asset::KioskAssetContractClient::new(&env, &asset_id);
    asset_client.initialize(
        &owner,
        &0,
        &String::from_str(&env, "Developer Pass"),
        &String::from_str(&env, "PASS"),
    );
    asset_client.mint(&seller, &1);

    // 2. Create payment token
    let (payment_addr, payment_client, payment_admin) = create_token_contract(&env, &owner);
    payment_admin.mint(&buyer, &1000);

    // 3. Place & list
    let item_id = kiosk_client.place_and_list(
        &seller,
        &asset_id,
        &1,
        &payment_addr,
        &500,
        &String::from_str(&env, "Developer Pass #001"),
        &String::from_str(&env, "Access Pass"),
        &String::from_str(&env, "pass"),
    );

    assert_eq!(asset_client.balance(&kiosk_id), 1);
    assert_eq!(asset_client.balance(&buyer), 0);

    // 4. Buyer purchases
    kiosk_client.purchase(&buyer, &item_id);

    // Verify buyer received the real custom asset token!
    assert_eq!(asset_client.balance(&buyer), 1);
    assert_eq!(asset_client.balance(&kiosk_id), 0);

    // Verify payment routing (500 price: 10% royalty = 50, 450 net seller)
    assert_eq!(payment_client.balance(&royalty_recipient), 50);
    assert_eq!(payment_client.balance(&seller), 450);

    // 5. Attempting to withdraw an already sold item must fail
    let withdraw_res = kiosk_client.try_withdraw(&buyer, &item_id);
    assert_eq!(withdraw_res, Err(Ok(KioskError::ItemAlreadySold)));
}
