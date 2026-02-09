import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphQLClient } from "../lib/graphql-client";

// The Query (Read)
const GET_ABSENCES = gql`
  query GetAbsences {
    absences {
      id
      date
      reason
    }
  }
`;

// The Mutation (Write)
const CREATE_ABSENCE = gql`
  mutation CreateAbsence($date: String!, $reason: String!) {
    createAbsence(input: { date: $date, reason: $reason }) {
      id
    }
  }
`;

export const useAbsences = () => {
  return useQuery({
    queryKey: ["absences"],
    queryFn: async () => graphQLClient.request(GET_ABSENCES),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useCreateAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { date: string; reason: string }) =>
      graphQLClient.request(CREATE_ABSENCE, data),
    onSuccess: () => {
      // SECURITY & UX: Automatically refresh the list after adding
      queryClient.invalidateQueries({ queryKey: ["absences"] });
    },
  });
};
