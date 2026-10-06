#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String, Vec,
};

#[test]
fn test_initialize_and_policy() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let creator = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    client.initialize(&owner, &500, &creator, &100, &splits);

    let policy = client.get_policy();
    assert_eq!(policy.royalty_bps, 500);
    assert_eq!(policy.royalty_recipient, creator);
    assert_eq!(policy.min_floor_price, 100);
    assert_eq!(policy.upstream_splits.len(), 0);
    assert_eq!(client.get_owner(), owner);
}

#[test]
fn test_place_and_list() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    client.initialize(&owner, &500, &owner, &50, &splits);

    let title = String::from_str(&env, "Soroban Pass #1");
    let description = String::from_str(&env, "Test Dev Pass");
    let asset_type = String::from_str(&env, "Pass");

    let item_id = client.place_and_list(&seller, &title, &description, &asset_type, &200);
    assert_eq!(item_id, 1);

    let item = client.get_item(&item_id);
    assert_eq!(item.price, 200);
    assert_eq!(item.seller, seller);
    assert_eq!(item.is_listed, true);
    assert_eq!(item.title, title);

    assert_eq!(client.get_item_count(), 1);
}

#[test]
fn test_delist() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    client.initialize(&owner, &500, &owner, &50, &splits);

    let item_id = client.place_and_list(
        &seller,
        &String::from_str(&env, "Pass #2"),
        &String::from_str(&env, "Desc"),
        &String::from_str(&env, "License"),
        &150,
    );

    client.delist(&seller, &item_id);

    let item = client.get_item(&item_id);
    assert_eq!(item.is_listed, false);
}

#[test]
fn test_set_policy_with_upstream_splits() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let creator = Address::generate(&env);
    let upstream = Address::generate(&env);
    let splits: Vec<UpstreamSplit> = Vec::new(&env);

    client.initialize(&owner, &500, &creator, &100, &splits);

    let mut new_splits: Vec<UpstreamSplit> = Vec::new(&env);
    new_splits.push_back(UpstreamSplit {
        recipient: upstream.clone(),
        share_bps: 250,
    });

    client.set_policy(&owner, &750, &creator, &200, &new_splits);

    let updated_policy = client.get_policy();
    assert_eq!(updated_policy.royalty_bps, 750);
    assert_eq!(updated_policy.min_floor_price, 200);
    assert_eq!(updated_policy.upstream_splits.len(), 1);
    assert_eq!(updated_policy.upstream_splits.get(0).unwrap().recipient, upstream);
    assert_eq!(updated_policy.upstream_splits.get(0).unwrap().share_bps, 250);
}
