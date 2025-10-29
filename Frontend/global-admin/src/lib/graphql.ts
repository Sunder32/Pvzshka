import { ApolloClient, InMemoryCache, HttpLink, gql, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get token from localStorage
  const authData = localStorage.getItem('auth-storage');
  const token = authData ? JSON.parse(authData).state?.token : null;
  const user = authData ? JSON.parse(authData).state?.user : null;

  return {
    headers: {
      ...headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(user?.id && { 'x-user-id': user.id }),
      ...(user?.role && { 'x-user-role': user.role }),
    }
  };
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

// Queries
export const GET_SITE_CONFIG = gql`
  query GetSiteConfig($tenantId: ID!) {
    siteConfig(tenantId: $tenantId) {
      id
      tenantId
      logo
      theme {
        primaryColor
        secondaryColor
        fontFamily
        borderRadius
      }
      layout {
        header {
          showLogo
          showSearch
          showCart
          menu {
            label
            url
            icon
          }
        }
        footer {
          showNewsletter
          showSocial
          columns {
            title
            links {
              label
              url
            }
          }
        }
        sections {
          id
          type
          order
          visible
          config
        }
      }
      status
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const GET_TENANT_CONFIG = gql`
  query GetTenantConfig($tenantId: ID!) {
    tenantConfig(tenantId: $tenantId) {
      id
      name
      subdomain
      customDomain
      description
      logo
      favicon
      theme {
        primaryColor
        secondaryColor
        fontFamily
        borderRadius
      }
      features {
        enablePVZ
        enableMarketplace
        enableReviews
      }
    }
  }
`;

export const GET_APP_CONFIG = gql`
  query GetAppConfig($tenantId: ID!) {
    appConfig(tenantId: $tenantId) {
      tenant {
        id
        name
        subdomain
        logo
        theme {
          primaryColor
          secondaryColor
          fontFamily
          borderRadius
        }
      }
      siteConfig {
        layout {
          sections {
            id
            type
            order
            visible
            config
          }
        }
      }
    }
  }
`;

export const GET_ALL_TENANTS = gql`
  query GetAllTenants {
    allTenants {
      id
      name
      subdomain
      customDomain
      description
      theme {
        primaryColor
        secondaryColor
      }
    }
  }
`;

// Mutations
export const SAVE_SITE_CONFIG = gql`
  mutation SaveSiteConfig(
    $tenantId: ID!
    $logo: String
    $theme: ThemeInput!
    $layout: LayoutInput!
  ) {
    saveSiteConfig(
      tenantId: $tenantId
      logo: $logo
      theme: $theme
      layout: $layout
    ) {
      id
      status
      updatedAt
    }
  }
`;

export const PUBLISH_SITE_CONFIG = gql`
  mutation PublishSiteConfig($tenantId: ID!) {
    publishSiteConfig(tenantId: $tenantId) {
      id
      status
      publishedAt
    }
  }
`;

export const UPDATE_THEME = gql`
  mutation UpdateTheme($tenantId: ID!, $theme: ThemeInput!) {
    updateTheme(tenantId: $tenantId, theme: $theme) {
      id
      theme {
        primaryColor
        secondaryColor
        fontFamily
        borderRadius
      }
      updatedAt
    }
  }
`;

export const UPDATE_TENANT_CONFIG = gql`
  mutation UpdateTenantConfig(
    $tenantId: ID!
    $name: String
    $description: String
    $logo: String
    $favicon: String
    $customDomain: String
  ) {
    updateTenantConfig(
      tenantId: $tenantId
      name: $name
      description: $description
      logo: $logo
      favicon: $favicon
      customDomain: $customDomain
    ) {
      id
      name
      description
      logo
      favicon
      customDomain
    }
  }
`;

export const CREATE_TENANT = gql`
  mutation CreateTenant(
    $name: String!
    $subdomain: String!
    $description: String
  ) {
    createTenant(
      name: $name
      subdomain: $subdomain
      description: $description
    ) {
      id
      name
      subdomain
      theme {
        primaryColor
        secondaryColor
        fontFamily
        borderRadius
      }
    }
  }
`;

export default client;
