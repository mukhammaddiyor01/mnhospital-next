import { gql } from '@apollo/client';

export const ASK_HOSPITAL_ASSISTANT = gql`
  mutation AskHospitalAssistant($input: AskHospitalAssistantInput!) {
    askHospitalAssistant(input: $input) { status text }
  }
`;
