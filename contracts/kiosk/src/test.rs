#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env, IntoVal, String};

#[test]
fn test_initialize_and_policy() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let creator = Address::generate(&env);

    client.initialize(&owner, &500, &creator, &100);

    let policy = client.get_policy();
    assert_eq!(policy.royalty_bps, 500);
    assert_eq!(policy.royalty_recipient, creator);
    assert_eq!(policy.min_floor_price, 100);
}

#[test]
fn test_place_and_list() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, KioskContract);
    let client = KioskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&owner, &500, &owner, &50);

    let item_id = client.place_and_list(
        &seller,
        &String::from_str(&env, "Soroban Pass #1"),
        &200,
    );
    assert_eq!(item_id, 1);

    let item = client.get_item(&item_id);
    assert_eq!(item.price, 200);
    assert_eq!(item.seller, seller);
    assert_eq!(item.is_listed, true);
}
