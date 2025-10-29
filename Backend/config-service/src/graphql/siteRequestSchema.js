// GraphQL schema for site requests

export const siteRequestTypeDefs = `
  # User type (from auth-service)
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    role: String!
  }

  type SiteRequest {
    id: ID!
    siteName: String!
    domain: String!
    description: String!
    category: String!
    email: String!
    phone: String!
    expectedProducts: String
    businessType: String!
    tags: [String!]!
    status: SiteRequestStatus!
    createdAt: String!
    updatedAt: String!
    approvedAt: String
    rejectedAt: String
    rejectionReason: String
    userId: ID!
    user: User!
  }

  enum SiteRequestStatus {
    pending
    approved
    rejected
  }

  extend type Query {
    siteRequests(status: String): [SiteRequest!]!
    siteRequest(id: ID!): SiteRequest
    mySiteRequests: [SiteRequest!]!
  }

  extend type Mutation {
    createSiteRequest(input: CreateSiteRequestInput!): SiteRequest!
    approveSiteRequest(id: ID!): SiteRequest!
    rejectSiteRequest(id: ID!, reason: String!): SiteRequest!
    deleteSiteRequest(id: ID!): Boolean!
  }

  input CreateSiteRequestInput {
    siteName: String!
    domain: String!
    description: String!
    category: String!
    email: String!
    phone: String!
    expectedProducts: String
    businessType: String!
    tags: [String!]
  }

  type Site {
    id: ID!
    siteName: String!
    domain: String!
    status: SiteStatus!
    category: String!
    createdAt: String!
    lastModified: String!
    isEnabled: Boolean!
    userId: ID!
    user: User!
    stats: SiteStats
  }

  type SiteStats {
    products: Int!
    orders: Int!
    visitors: Int!
  }

  enum SiteStatus {
    pending
    approved
    rejected
    active
    disabled
  }

  extend type Query {
    mySites: [Site!]!
    site(id: ID!): Site
    allSites: [Site!]!
  }

  extend type Mutation {
    toggleSite(id: ID!, isEnabled: Boolean!): Site!
    deleteSite(id: ID!): Boolean!
  }
`;
