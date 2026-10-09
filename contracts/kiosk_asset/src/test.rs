#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String};

#[test]
fn test_initialize_and_metadata() {
    let env = Env::default();
    let contract_id = env.register_contract(None, KioskAssetContract);
    let client = KioskAssetContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(
        &admin,
        &0,
        &String::from_str(&env, "Axon Enterprise License"),
        &String::from_str(&env, "AXON"),
    );

    assert_eq!(
        client.name(),
        String::from_str(&env, "Axon Enterprise License")
    );
    assert_eq!(client.symbol(), String::from_str(&env, "AXON"));
    assert_eq!(client.decimals(), 0);
}

#[test]
fn test_mint_and_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskAssetContract);
    let client = KioskAssetContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    client.initialize(
        &admin,
        &0,
        &String::from_str(&env, "Axon Enterprise License"),
        &String::from_str(&env, "AXON"),
    );

    assert_eq!(client.balance(&user1), 0);

    // Mint 5 licenses to user1
    client.mint(&user1, &5);
    assert_eq!(client.balance(&user1), 5);

    // Transfer 2 licenses from user1 to user2
    client.transfer(&user1, &user2, &2);
    assert_eq!(client.balance(&user1), 3);
    assert_eq!(client.balance(&user2), 2);
}

#[test]
fn test_allowance_and_transfer_from() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskAssetContract);
    let client = KioskAssetContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let spender = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.initialize(
        &admin,
        &0,
        &String::from_str(&env, "Axon Enterprise License"),
        &String::from_str(&env, "AXON"),
    );

    client.mint(&user1, &10);

    // Approve 4 licenses for spender until ledger 1000
    client.approve(&user1, &spender, &4, &1000);
    assert_eq!(client.allowance(&user1, &spender), 4);

    // Spender transfers 3 from user1 to recipient
    client.transfer_from(&spender, &user1, &recipient, &3);
    assert_eq!(client.balance(&user1), 7);
    assert_eq!(client.balance(&recipient), 3);
    assert_eq!(client.allowance(&user1, &spender), 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_insufficient_balance_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskAssetContract);
    let client = KioskAssetContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    client.initialize(
        &admin,
        &0,
        &String::from_str(&env, "Axon Enterprise License"),
        &String::from_str(&env, "AXON"),
    );

    client.mint(&user1, &1);
    // Attempt to transfer 2 when balance is 1 (should panic with InsufficientBalance = 5)
    client.transfer(&user1, &user2, &2);
}
