import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { GraphQLClient } from "graphql-request";
import Cookies from "js-cookie";

const endpoint =
  process.env["NX_GRAPHQL_ENDPOINT"] || "https://my-api.com/graphql";

const authToken = Cookies.get("auth_token");

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: () => {
    // SECURITY: Always pull fresh token from storage
    const token = localStorage.getItem("token");
    return {
      authorization: token ? `Bearer ${token}` : "",
    };
  },
});

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: endpoint,
    credentials: "include",
    headers: {
      authorization: authToken ? `Bearer ${authToken}` : "",
    },
  }),
  cache: new InMemoryCache({
    // Garbage collection configuration
    resultCaching: true,
    typePolicies: {
      Query: {
        fields: {
          // Define field policies here if needed
        },
      },
    },
  }),
});

// Optional: Helper to reset cache on logout
export const resetCache = () => {
  apolloClient.cache.reset();
};
