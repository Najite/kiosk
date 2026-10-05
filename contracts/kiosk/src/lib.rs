#![no_std]

mod types;

#[cfg(test)]
mod test;

use soroban_sdk::{
    contract, contracterror, contractimpl, symbol_short, token, Address, Env, IntoVal, String, Symbol, Val,
};
pub use types::{DataKey, ListingItem, TransferPolicy};

const KIOSK: Symbol = symbol_short!("KIOSK");

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum KioskError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    ItemNotFound = 4,
    ItemNotListed = 5,
    PriceBelowFloor = 6,
    InvalidBps = 7,
    InvalidPrice = 8,
}

#[contract]
pub struct KioskContract;

#[contractimpl]
impl KioskContract {
    /// Initialize the Kiosk with an admin/owner and default policy
    pub fn initialize(
        env: Env,
        owner: Address,
        royalty_bps: u32,
        royalty_recipient: Address,
        min_floor_price: i128,
    ) -> Result<(), KioskError> {
        if env.storage().instance().has(&DataKey::Owner) {
            return Err(KioskError::AlreadyInitialized);
        }
        if royalty_bps > 10_000 {
            return Err(KioskError::InvalidBps);
        }

        owner.require_auth();

        env.storage().instance().set(&DataKey::Owner, &owner);

        let policy = TransferPolicy {
            royalty_bps,
            royalty_recipient,
            min_floor_price,
        };
        env.storage().instance().set(&DataKey::Policy, &policy);
        env.storage().instance().set(&DataKey::ItemCount, &0u32);

        env.events().publish(
            (KIOSK, symbol_short!("init")),
            (owner, royalty_bps),
        );

        Ok(())
    }

    /// Update the transfer policy (owner only)
    pub fn set_policy(
        env: Env,
        caller: Address,
        royalty_bps: u32,
        royalty_recipient: Address,
        min_floor_price: i128,
    ) -> Result<(), KioskError> {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(KioskError::NotInitialized)?;

        if caller != owner {
            return Err(KioskError::Unauthorized);
        }
        caller.require_auth();

        if royalty_bps > 10_000 {
            return Err(KioskError::InvalidBps);
        }

        let policy = TransferPolicy {
            royalty_bps,
            royalty_recipient,
            min_floor_price,
        };
        env.storage().instance().set(&DataKey::Policy, &policy);

        env.events().publish(
            (KIOSK, symbol_short!("set_pol")),
            royalty_bps,
        );

        Ok(())
    }

    /// Place and list an item in the kiosk
    pub fn place_and_list(
        env: Env,
        seller: Address,
        title: String,
        price: i128,
    ) -> Result<u32, KioskError> {
        seller.require_auth();

        let policy: TransferPolicy = env
            .storage()
            .instance()
            .get(&DataKey::Policy)
            .ok_or(KioskError::NotInitialized)?;

        if price <= 0 {
            return Err(KioskError::InvalidPrice);
        }

        if price < policy.min_floor_price {
            return Err(KioskError::PriceBelowFloor);
        }

        let mut item_count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::ItemCount)
            .unwrap_or(0);

        item_count += 1;

        let item = ListingItem {
            id: item_count,
            title,
            price,
            is_listed: true,
            seller: seller.clone(),
        };

        env.storage().persistent().set(&DataKey::Item(item_count), &item);
        env.storage().instance().set(&DataKey::ItemCount, &item_count);

        env.events().publish(
            (KIOSK, symbol_short!("listed")),
            (item_count, seller, price),
        );

        Ok(item_count)
    }

    /// Delist an item
    pub fn delist(env: Env, caller: Address, item_id: u32) -> Result<(), KioskError> {
        let mut item: ListingItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .ok_or(KioskError::ItemNotFound)?;

        if caller != item.seller {
            return Err(KioskError::Unauthorized);
        }
        caller.require_auth();

        item.is_listed = false;
        env.storage().persistent().set(&DataKey::Item(item_id), &item);

        env.events().publish(
            (KIOSK, symbol_short!("delisted")),
            item_id,
        );

        Ok(())
    }

    /// Purchase a listed item enforcing royalty and seller splits via Stellar asset token
    pub fn purchase(
        env: Env,
        buyer: Address,
        item_id: u32,
        payment_token: Address,
    ) -> Result<(), KioskError> {
        buyer.require_auth();

        let mut item: ListingItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .ok_or(KioskError::ItemNotFound)?;

        if !item.is_listed {
            return Err(KioskError::ItemNotListed);
        }

        let policy: TransferPolicy = env
            .storage()
            .instance()
            .get(&DataKey::Policy)
            .ok_or(KioskError::NotInitialized)?;

        let token_client = token::Client::new(&env, &payment_token);

        // Calculate payout splits
        let royalty_amount = (item.price * (policy.royalty_bps as i128)) / 10_000;
        let seller_amount = item.price - royalty_amount;

        // Execute payment transfers
        if royalty_amount > 0 {
            token_client.transfer(&buyer, &policy.royalty_recipient, &royalty_amount);
        }
        token_client.transfer(&buyer, &item.seller, &seller_amount);

        // Mark as unlisted / sold
        item.is_listed = false;
        env.storage().persistent().set(&DataKey::Item(item_id), &item);

        env.events().publish(
            (KIOSK, symbol_short!("bought")),
            (item_id, buyer, item.price),
        );

        Ok(())
    }

    /// Get current policy
    pub fn get_policy(env: Env) -> Result<TransferPolicy, KioskError> {
        env.storage()
            .instance()
            .get(&DataKey::Policy)
            .ok_or(KioskError::NotInitialized)
    }

    /// Get item details
    pub fn get_item(env: Env, item_id: u32) -> Result<ListingItem, KioskError> {
        env.storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .ok_or(KioskError::ItemNotFound)
    }
}
