import { gql } from '@apollo/client';
export const operation = (kind: 'query'|'mutation', field: string, inputType: string | null, selection: string, argument='input') => gql(`${kind} Workspace${field[0].toUpperCase()+field.slice(1)}${inputType?`($${argument}: ${inputType}!)`:''} { ${field}${inputType?`(${argument}: $${argument})`:''} { ${selection} } }`);
