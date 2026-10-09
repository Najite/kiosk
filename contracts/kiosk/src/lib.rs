#![no_std]
#![allow(clippy::too_many_arguments)]

mod types;

#[cfg(test)]
mod test;

use soroban_sdk::{
    contract, contracterror, contractimpl, symbol_short, token, Address, Env, String, Symbol, Vec,
};
pub use types::{DataKey, ItemStatus, ListingItem, TransferPolicy, UpstreamSplit};

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
    InvalidAmount = 9,
    ItemAlreadyListed = 10,
    CannotWithdrawListed = 11,
}

fn validate_policy_bps(
    royalty_bps: u32,
    upstream_splits: &Vec<UpstreamSplit>,
) -> Result<(), KioskError> {
    let mut total_upstream_bps: u32 = 0;
    for i in 0..upstream_splits.len() {
        let split = upstream_splits.get(i).unwrap();
        total_upstream_bps += split.share_bps;
    }
    if royalty_bps + total_upstream_bps > 10_000 {
        return Err(KioskError::InvalidBps);
    }
    Ok(())
}

fn get_effective_policy(env: &Env, asset_contract: &Address) -> Result<TransferPolicy, KioskError> {
    if let Some(policy) = env
        .storage()
        .persistent()
        .get(&DataKey::AssetPolicy(asset_contract.clone()))
    {
        return Ok(policy);
    }
    env.storage()
        .instance()
        .get(&DataKey::DefaultPolicy)
        .ok_or(KioskError::NotInitialized)
}

#[contract]
pub struct KioskContract;

impl KioskContract {
    fn do_place(
        env: &Env,
        seller: &Address,
        asset_contract: &Address,
        asset_amount: i128,
        title: String,
        description: String,
        asset_type: String,
    ) -> Result<u32, KioskError> {
        if asset_amount <= 0 {
            return Err(KioskError::InvalidAmount);
        }

        // Transfer the asset from the seller into the Kiosk contract custody
        let contract_address = env.current_contract_address();
        let asset_client = token::Client::new(env, asset_contract);
        asset_client.transfer(seller, &contract_address, &asset_amount);

        let mut item_count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::ItemCount)
            .unwrap_or(0);

        item_count += 1;

        let item = ListingItem {
            id: item_count,
            seller: seller.clone(),
            asset_contract: asset_contract.clone(),
            asset_amount,
            payment_token: asset_contract.clone(), // Placeholder until listed
            price: 0,
            is_listed: false,
            status: ItemStatus::Placed,
            title,
            description,
            asset_type,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Item(item_count), &item);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Item(item_count), 50_000, 100_000);
        env.storage()
            .instance()
            .set(&DataKey::ItemCount, &item_count);
        env.storage().instance().extend_ttl(50_000, 100_000);

        env.events().publish(
            (KIOSK, symbol_short!("placed")),
            (item_count, seller, asset_amount),
        );

        Ok(item_count)
    }

    fn do_list(
        env: &Env,
        seller: &Address,
        item_id: u32,
        price: i128,
        payment_token: &Address,
    ) -> Result<(), KioskError> {
        let mut item: ListingItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .ok_or(KioskError::ItemNotFound)?;

        if &item.seller != seller {
            return Err(KioskError::Unauthorized);
        }

        if item.status != ItemStatus::Placed {
            return Err(KioskError::ItemAlreadyListed);
        }

        if price <= 0 {
            return Err(KioskError::InvalidPrice);
        }

        let policy = get_effective_policy(env, &item.asset_contract)?;
        if price < policy.min_floor_price {
            return Err(KioskError::PriceBelowFloor);
        }

        item.price = price;
        item.payment_token = payment_token.clone();
        item.is_listed = true;
        item.status = ItemStatus::Listed;

        env.storage()
            .persistent()
            .set(&DataKey::Item(item_id), &item);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Item(item_id), 50_000, 100_000);

        env.events().publish(
            (KIOSK, symbol_short!("listed")),
            (item_id, seller, price, payment_token),
        );

        Ok(())
    }
}

#[contractimpl]
impl KioskContract {
    /// Initialize the Kiosk protocol with an admin/owner, default policy, and optional upstream splits
    pub fn initialize(
        env: Env,
        owner: Address,
        royalty_bps: u32,
        royalty_recipient: Address,
        min_floor_price: i128,
        upstream_splits: Vec<UpstreamSplit>,
    ) -> Result<(), KioskError> {
        if env.storage().instance().has(&DataKey::Owner) {
            return Err(KioskError::AlreadyInitialized);
        }

        validate_policy_bps(royalty_bps, &upstream_splits)?;

        owner.require_auth();

        env.storage().instance().set(&DataKey::Owner, &owner);

        let default_policy = TransferPolicy {
            royalty_bps,
            royalty_recipient,
            min_floor_price,
            upstream_splits,
        };
        env.storage()
            .instance()
            .set(&DataKey::DefaultPolicy, &default_policy);
        env.storage().instance().set(&DataKey::ItemCount, &0u32);
        env.storage().instance().extend_ttl(50_000, 100_000);

        env.events()
            .publish((KIOSK, symbol_short!("init")), (owner, royalty_bps));

        Ok(())
    }

    /// Update the default fallback transfer policy (protocol owner only)
    pub fn set_policy(
        env: Env,
        caller: Address,
        royalty_bps: u32,
        royalty_recipient: Address,
        min_floor_price: i128,
        upstream_splits: Vec<UpstreamSplit>,
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

        validate_policy_bps(royalty_bps, &upstream_splits)?;

        let policy = TransferPolicy {
            royalty_bps,
            royalty_recipient,
            min_floor_price,
            upstream_splits,
        };
        env.storage()
            .instance()
            .set(&DataKey::DefaultPolicy, &policy);
        env.storage().instance().extend_ttl(50_000, 100_000);

        env.events()
            .publish((KIOSK, symbol_short!("set_pol")), royalty_bps);

        Ok(())
    }

    /// Configure or update a collection-specific transfer policy for an asset contract (creator auth required)
    pub fn set_asset_policy(
        env: Env,
        creator: Address,
        asset_contract: Address,
        royalty_bps: u32,
        royalty_recipient: Address,
        min_floor_price: i128,
        upstream_splits: Vec<UpstreamSplit>,
    ) -> Result<(), KioskError> {
        creator.require_auth();

        validate_policy_bps(royalty_bps, &upstream_splits)?;

        let policy = TransferPolicy {
            royalty_bps,
            royalty_recipient,
            min_floor_price,
            upstream_splits,
        };

        env.storage()
            .persistent()
            .set(&DataKey::AssetPolicy(asset_contract.clone()), &policy);
        env.storage().persistent().extend_ttl(
            &DataKey::AssetPolicy(asset_contract.clone()),
            50_000,
            100_000,
        );

        env.events().publish(
            (KIOSK, symbol_short!("ast_pol")),
            (asset_contract, royalty_bps),
        );

        Ok(())
    }

    /// Deposit and place an asset into the Kiosk contract custody vault (Placed state, not listed)
    pub fn place(
        env: Env,
        seller: Address,
        asset_contract: Address,
        asset_amount: i128,
        title: String,
        description: String,
        asset_type: String,
    ) -> Result<u32, KioskError> {
        seller.require_auth();
        Self::do_place(
            &env,
            &seller,
            &asset_contract,
            asset_amount,
            title,
            description,
            asset_type,
        )
    }

    /// List an already placed asset in the Kiosk with an explicit price and bound payment token
    pub fn list(
        env: Env,
        seller: Address,
        item_id: u32,
        price: i128,
        payment_token: Address,
    ) -> Result<(), KioskError> {
        seller.require_auth();
        Self::do_list(&env, &seller, item_id, price, &payment_token)
    }

    /// Atomic convenience entrypoint: deposit asset into custody AND list it in a single transaction
    pub fn place_and_list(
        env: Env,
        seller: Address,
        asset_contract: Address,
        asset_amount: i128,
        payment_token: Address,
        price: i128,
        title: String,
        description: String,
        asset_type: String,
    ) -> Result<u32, KioskError> {
        seller.require_auth();
        let item_id = Self::do_place(
            &env,
            &seller,
            &asset_contract,
            asset_amount,
            title,
            description,
            asset_type,
        )?;
        Self::do_list(&env, &seller, item_id, price, &payment_token)?;
        Ok(item_id)
    }

    /// Delist an item (returns to Placed state, asset remains safely in Kiosk custody)
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

        if item.status != ItemStatus::Listed {
            return Err(KioskError::ItemNotListed);
        }

        item.is_listed = false;
        item.status = ItemStatus::Placed;

        env.storage()
            .persistent()
            .set(&DataKey::Item(item_id), &item);

        env.events()
            .publish((KIOSK, symbol_short!("delisted")), item_id);

        Ok(())
    }

    /// Reprice an actively listed item
    pub fn update_price(
        env: Env,
        caller: Address,
        item_id: u32,
        new_price: i128,
    ) -> Result<(), KioskError> {
        let mut item: ListingItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .ok_or(KioskError::ItemNotFound)?;

        if caller != item.seller {
            return Err(KioskError::Unauthorized);
        }
        caller.require_auth();

        if item.status != ItemStatus::Listed {
            return Err(KioskError::ItemNotListed);
        }

        if new_price <= 0 {
            return Err(KioskError::InvalidPrice);
        }

        let policy = get_effective_policy(&env, &item.asset_contract)?;
        if new_price < policy.min_floor_price {
            return Err(KioskError::PriceBelowFloor);
        }

        item.price = new_price;
        env.storage()
            .persistent()
            .set(&DataKey::Item(item_id), &item);

        env.events()
            .publish((KIOSK, symbol_short!("reprice")), (item_id, new_price));

        Ok(())
    }

    /// Withdraw an unlisted/placed asset from Kiosk contract custody back to seller's wallet
    pub fn withdraw(env: Env, caller: Address, item_id: u32) -> Result<(), KioskError> {
        let item: ListingItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .ok_or(KioskError::ItemNotFound)?;

        if caller != item.seller {
            return Err(KioskError::Unauthorized);
        }
        caller.require_auth();

        if item.status == ItemStatus::Listed {
            return Err(KioskError::CannotWithdrawListed);
        }

        // Transfer the escrowed asset from the Kiosk contract back to the seller
        let contract_address = env.current_contract_address();
        let asset_client = token::Client::new(&env, &item.asset_contract);
        asset_client.transfer(&contract_address, &caller, &item.asset_amount);

        // Remove item from persistent storage to reclaim state rent
        env.storage().persistent().remove(&DataKey::Item(item_id));

        env.events()
            .publish((KIOSK, symbol_short!("withdraw")), (item_id, caller));

        Ok(())
    }

    /// Purchase an active listing.
    /// Atomically executes payment splits using the listing's bound payment token,
    /// delivers the escrowed asset to the buyer, and transitions the listing to Sold.
    pub fn purchase(env: Env, buyer: Address, item_id: u32) -> Result<(), KioskError> {
        buyer.require_auth();

        let mut item: ListingItem = env
            .storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .ok_or(KioskError::ItemNotFound)?;

        if item.status != ItemStatus::Listed || !item.is_listed {
            return Err(KioskError::ItemNotListed);
        }

        let policy = get_effective_policy(&env, &item.asset_contract)?;

        // Payment token client uses the bound payment token from the listing
        let payment_client = token::Client::new(&env, &item.payment_token);

        // 1. Calculate creator royalty
        let royalty_amount = (item.price * (policy.royalty_bps as i128)) / 10_000;

        // 2. Calculate and execute upstream splits atomically
        let mut total_upstream_amount: i128 = 0;
        for i in 0..policy.upstream_splits.len() {
            let split = policy.upstream_splits.get(i).unwrap();
            let split_amount = (item.price * (split.share_bps as i128)) / 10_000;
            if split_amount > 0 {
                payment_client.transfer(&buyer, &split.recipient, &split_amount);
                total_upstream_amount += split_amount;
            }
        }

        // 3. Calculate remaining seller amount
        let seller_amount = item.price - royalty_amount - total_upstream_amount;

        // 4. Execute creator royalty transfer
        if royalty_amount > 0 {
            payment_client.transfer(&buyer, &policy.royalty_recipient, &royalty_amount);
        }

        // 5. Execute seller payout transfer
        if seller_amount > 0 {
            payment_client.transfer(&buyer, &item.seller, &seller_amount);
        }

        // 6. Deliver the escrowed asset from Kiosk contract custody to the buyer
        let contract_address = env.current_contract_address();
        let asset_client = token::Client::new(&env, &item.asset_contract);
        asset_client.transfer(&contract_address, &buyer, &item.asset_amount);

        // 7. Update item status to Sold and record the new owner
        item.is_listed = false;
        item.status = ItemStatus::Sold;
        item.seller = buyer.clone(); // Transferred ownership

        env.storage()
            .persistent()
            .set(&DataKey::Item(item_id), &item);

        env.events().publish(
            (KIOSK, symbol_short!("bought")),
            (item_id, buyer, item.price),
        );

        Ok(())
    }

    /// Read default policy
    pub fn get_default_policy(env: Env) -> Result<TransferPolicy, KioskError> {
        env.storage()
            .instance()
            .get(&DataKey::DefaultPolicy)
            .ok_or(KioskError::NotInitialized)
    }

    /// Read collection-specific asset policy
    pub fn get_asset_policy(
        env: Env,
        asset_contract: Address,
    ) -> Result<TransferPolicy, KioskError> {
        env.storage()
            .persistent()
            .get(&DataKey::AssetPolicy(asset_contract))
            .ok_or(KioskError::NotInitialized)
    }

    /// Read effective policy for an asset (returns asset policy if set, otherwise default policy)
    pub fn get_policy(
        env: Env,
        asset_contract: Option<Address>,
    ) -> Result<TransferPolicy, KioskError> {
        if let Some(asset) = asset_contract {
            get_effective_policy(&env, &asset)
        } else {
            Self::get_default_policy(env)
        }
    }

    /// Get item details
    pub fn get_item(env: Env, item_id: u32) -> Result<ListingItem, KioskError> {
        env.storage()
            .persistent()
            .get(&DataKey::Item(item_id))
            .ok_or(KioskError::ItemNotFound)
    }

    /// Get total items created in the Kiosk
    pub fn get_item_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::ItemCount)
            .unwrap_or(0)
    }

    /// Get kiosk admin/owner address
    pub fn get_owner(env: Env) -> Result<Address, KioskError> {
        env.storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(KioskError::NotInitialized)
    }
}
