export type AssetCategory = 'license' | 'pass' | 'badge' | 'collectible';

export interface UpstreamSplit {
  recipient: string;
  bps: number; // basis points (100 = 1%)
  label: string;
}

export interface TransferPolicy {
  owner: string;
  royaltyBps: number;
  royaltyRecipient: string;
  minFloorPrice: number;
  upstreamSplits: UpstreamSplit[];
}

export interface ListingItem {
  id: number;
  seller: string;
  title: string;
  description: string;
  assetType: AssetCategory;
  assetContract?: string;
  assetAmount?: number;
  paymentToken?: string;
  price: number; // In XLM or payment token
  isListed: boolean;
  status: 'placed' | 'listed' | 'sold';
  royaltyBps?: number;
  badge?: string;
  image?: string;
  createdAt: string;
}

export interface TransactionReceipt {
  hash: string;
  type: 'purchase' | 'list' | 'delist' | 'policy_update';
  itemId?: number;
  itemTitle?: string;
  amount?: number;
  seller?: string;
  buyer?: string;
  payouts?: {
    sellerNet: number;
    creatorRoyalty: number;
    protocolTreasury: number;
  };
  timestamp: string;
  ledger: number;
}
