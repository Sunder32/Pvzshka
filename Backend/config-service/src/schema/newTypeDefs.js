export const typeDefs = `#graphql
  scalar JSON

  # Theme Configuration
  type Theme {
    primaryColor: String!
    secondaryColor: String!
    fontFamily: String!
    borderRadius: Int!
  }

  input ThemeInput {
    primaryColor: String!
    secondaryColor: String!
    fontFamily: String!
    borderRadius: Int!
  }

  # Site Configuration
  type SiteConfig {
    id: ID!
    tenantId: ID!
    logo: String
    theme: Theme!
    layout: Layout!
    status: String!
    createdAt: String!
    updatedAt: String!
    publishedAt: String
  }

  type Layout {
    header: HeaderConfig
    footer: FooterConfig
    sections: [Section!]!
  }

  input LayoutInput {
    header: HeaderConfigInput
    footer: FooterConfigInput
    sections: [SectionInput!]!
  }

  # Header Configuration
  type HeaderConfig {
    showLogo: Boolean!
    showSearch: Boolean!
    showCart: Boolean!
    menu: [MenuItem!]!
  }

  input HeaderConfigInput {
    showLogo: Boolean
    showSearch: Boolean
    showCart: Boolean
    menu: [MenuItemInput!]
  }

  type MenuItem {
    label: String!
    url: String!
    icon: String
  }

  input MenuItemInput {
    label: String!
    url: String!
    icon: String
  }

  # Footer Configuration
  type FooterConfig {
    showNewsletter: Boolean!
    showSocial: Boolean!
    columns: [FooterColumn!]!
  }

  input FooterConfigInput {
    showNewsletter: Boolean
    showSocial: Boolean
    columns: [FooterColumnInput!]
  }

  type FooterColumn {
    title: String!
    links: [FooterLink!]!
  }

  input FooterColumnInput {
    title: String!
    links: [FooterLinkInput!]
  }

  type FooterLink {
    label: String!
    url: String!
  }

  input FooterLinkInput {
    label: String!
    url: String!
  }

  # Section Configuration
  type Section {
    id: ID!
    type: String!
    order: Int!
    visible: Boolean!
    config: JSON!
  }

  input SectionInput {
    id: ID
    type: String!
    order: Int!
    visible: Boolean!
    config: JSON!
  }

  # Features
  type Features {
    enablePVZ: Boolean!
    enableMarketplace: Boolean!
    enableReviews: Boolean!
  }

  input FeaturesInput {
    enablePVZ: Boolean
    enableMarketplace: Boolean
    enableReviews: Boolean
  }

  # Tenant Configuration
  type TenantConfig {
    id: ID!
    name: String!
    subdomain: String!
    customDomain: String
    description: String
    logo: String
    favicon: String
    theme: Theme!
    features: Features!
  }

  # Complete App Configuration
  type AppConfig {
    tenant: TenantConfig!
    siteConfig: SiteConfig!
  }

  # Queries
  type Query {
    # Site Configuration
    siteConfig(tenantId: ID!): SiteConfig
    siteConfigBySubdomain(subdomain: String!): SiteConfig

    # Tenant Configuration
    tenantConfig(tenantId: ID!): TenantConfig
    tenantConfigBySubdomain(subdomain: String!): TenantConfig

    # Complete app configuration for mobile/web
    appConfig(tenantId: ID!): AppConfig
    appConfigBySubdomain(subdomain: String!): AppConfig

    # List all tenants (admin only)
    allTenants: [TenantConfig!]!
  }

  # Mutations
  type Mutation {
    # Create/Update Site Configuration
    saveSiteConfig(
      tenantId: ID!
      logo: String
      theme: ThemeInput!
      layout: LayoutInput!
    ): SiteConfig!

    # Publish site configuration
    publishSiteConfig(tenantId: ID!): SiteConfig!

    # Update tenant settings
    updateTenantConfig(
      tenantId: ID!
      name: String
      description: String
      logo: String
      favicon: String
      customDomain: String
    ): TenantConfig!

    # Update theme only
    updateTheme(tenantId: ID!, theme: ThemeInput!): SiteConfig!

    # Update features
    updateFeatures(tenantId: ID!, features: FeaturesInput!): TenantConfig!

    # Create new tenant (admin only)
    createTenant(
      name: String!
      subdomain: String!
      description: String
    ): TenantConfig!

    # Support Tickets
    createSupportTicket(
      tenantId: ID!
      subject: String!
      category: String!
      priority: String!
      description: String!
    ): SupportTicket!

    replyToTicket(
      ticketId: ID!
      message: String!
      authorType: String!
    ): SupportTicket!

    updateTicketStatus(
      ticketId: ID!
      status: String!
      assignedTo: String
    ): SupportTicket!
  }

  # Support Ticket Types
  type SupportTicket {
    id: ID!
    tenantId: ID!
    tenantName: String
    subject: String!
    category: String!
    priority: String!
    status: String!
    description: String!
    assignedTo: String
    createdAt: String!
    updatedAt: String!
    messages: [TicketMessage!]!
  }

  type TicketMessage {
    id: ID!
    ticketId: ID!
    author: String!
    authorType: String!
    message: String!
    createdAt: String!
  }

  # Support Queries
  extend type Query {
    supportTickets(tenantId: ID): [SupportTicket!]!
    supportTicket(ticketId: ID!): SupportTicket
    myTickets(tenantId: ID!): [SupportTicket!]!
  }
`;
