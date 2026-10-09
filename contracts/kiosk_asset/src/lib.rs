#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TokenError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    NegativeAmount = 4,
    InsufficientBalance = 5,
    InsufficientAllowance = 6,
    AllowanceExpired = 7,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AllowanceDataKey {
    pub from: Address,
    pub spender: Address,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AllowanceValue {
    pub amount: i128,
    pub expiration_ledger: u32,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    Decimals,
    Balance(Address),
    Allowance(AllowanceDataKey),
}

const TOKEN: Symbol = symbol_short!("TOKEN");

#[contract]
pub struct KioskAssetContract;

#[contractimpl]
impl KioskAssetContract {
    /// Initialize token metadata and administrator
    pub fn initialize(
        env: Env,
        admin: Address,
        decimal: u32,
        name: String,
        symbol: String,
    ) -> Result<(), TokenError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(TokenError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Decimals, &decimal);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);

        env.storage().instance().extend_ttl(50_000, 100_000);
        Ok(())
    }

    /// Mint tokens to recipient (admin authorization required)
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), TokenError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(TokenError::NotInitialized)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(TokenError::NegativeAmount);
        }

        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);

        let new_balance = current_balance + amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &new_balance);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(to.clone()), 50_000, 100_000);

        env.events()
            .publish((TOKEN, symbol_short!("mint")), (to, amount));

        Ok(())
    }

    /// Read account balance
    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(id))
            .unwrap_or(0)
    }

    /// Standard SEP-0041 transfer
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> Result<(), TokenError> {
        from.require_auth();

        if amount <= 0 {
            return Err(TokenError::NegativeAmount);
        }

        let from_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);

        if from_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        let to_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));

        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(from.clone()), 50_000, 100_000);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(to.clone()), 50_000, 100_000);

        env.events()
            .publish((TOKEN, symbol_short!("transfer")), (from, to, amount));

        Ok(())
    }

    /// Transfer on behalf of an account using approved allowance
    pub fn transfer_from(
        env: Env,
        spender: Address,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), TokenError> {
        spender.require_auth();

        if amount <= 0 {
            return Err(TokenError::NegativeAmount);
        }

        let allowance_key = DataKey::Allowance(AllowanceDataKey {
            from: from.clone(),
            spender: spender.clone(),
        });

        let allowance: AllowanceValue = env
            .storage()
            .temporary()
            .get(&allowance_key)
            .ok_or(TokenError::InsufficientAllowance)?;

        if allowance.expiration_ledger < env.ledger().sequence() {
            return Err(TokenError::AllowanceExpired);
        }

        if allowance.amount < amount {
            return Err(TokenError::InsufficientAllowance);
        }

        let from_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);

        if from_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        let to_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));

        let remaining_allowance = AllowanceValue {
            amount: allowance.amount - amount,
            expiration_ledger: allowance.expiration_ledger,
        };
        env.storage()
            .temporary()
            .set(&allowance_key, &remaining_allowance);

        env.events()
            .publish((TOKEN, symbol_short!("transfer")), (from, to, amount));

        Ok(())
    }

    /// Approve an allowance for a spender
    pub fn approve(
        env: Env,
        from: Address,
        spender: Address,
        amount: i128,
        expiration_ledger: u32,
    ) -> Result<(), TokenError> {
        from.require_auth();

        if amount < 0 {
            return Err(TokenError::NegativeAmount);
        }

        let allowance_key = DataKey::Allowance(AllowanceDataKey {
            from: from.clone(),
            spender: spender.clone(),
        });

        let allowance = AllowanceValue {
            amount,
            expiration_ledger,
        };

        env.storage().temporary().set(&allowance_key, &allowance);
        Ok(())
    }

    /// Read approved allowance
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let allowance_key = DataKey::Allowance(AllowanceDataKey { from, spender });
        if let Some(allowance) = env
            .storage()
            .temporary()
            .get::<DataKey, AllowanceValue>(&allowance_key)
        {
            if allowance.expiration_ledger >= env.ledger().sequence() {
                return allowance.amount;
            }
        }
        0
    }

    /// Burn tokens from account
    pub fn burn(env: Env, from: Address, amount: i128) -> Result<(), TokenError> {
        from.require_auth();

        if amount <= 0 {
            return Err(TokenError::NegativeAmount);
        }

        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);

        if current_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(current_balance - amount));

        env.events()
            .publish((TOKEN, symbol_short!("burn")), (from, amount));
        Ok(())
    }

    /// Burn tokens using spender allowance
    pub fn burn_from(
        env: Env,
        spender: Address,
        from: Address,
        amount: i128,
    ) -> Result<(), TokenError> {
        spender.require_auth();

        if amount <= 0 {
            return Err(TokenError::NegativeAmount);
        }

        let allowance_key = DataKey::Allowance(AllowanceDataKey {
            from: from.clone(),
            spender: spender.clone(),
        });

        let allowance: AllowanceValue = env
            .storage()
            .temporary()
            .get(&allowance_key)
            .ok_or(TokenError::InsufficientAllowance)?;

        if allowance.expiration_ledger < env.ledger().sequence() {
            return Err(TokenError::AllowanceExpired);
        }

        if allowance.amount < amount {
            return Err(TokenError::InsufficientAllowance);
        }

        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);

        if current_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(current_balance - amount));

        let remaining_allowance = AllowanceValue {
            amount: allowance.amount - amount,
            expiration_ledger: allowance.expiration_ledger,
        };
        env.storage()
            .temporary()
            .set(&allowance_key, &remaining_allowance);

        env.events()
            .publish((TOKEN, symbol_short!("burn")), (from, amount));
        Ok(())
    }

    /// Token decimals
    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Decimals)
            .unwrap_or(0)
    }

    /// Token display name
    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Name)
            .unwrap_or_else(|| String::from_str(&env, "Kiosk Asset"))
    }

    /// Token symbol
    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Symbol)
            .unwrap_or_else(|| String::from_str(&env, "KIOSK"))
    }
}

#[cfg(test)]
mod test;
