import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
    mutation login($email: String!, $password: String!){
        login(email: $email, password: $password){
            token
            user {
                _id
                username
                email
            }
        }
    }
`;

export const ADD_USER = gql`
    mutation Mutation($input: UserInput!){
        addUser(input: $input){
            user {
                _id
                username
                email
                password 
            }
            token
        }
    }
`;

export const SAVE_LOOP = gql`
mutation Mutation($input: LoopInput!) {
  saveLoop(input: $input) {
    frames {
      canvasImg
      frameId
    }
    title
    userId
  }
}
`;

export const CREATE_COMMENT = gql`
    mutation CreateComment($input: CreateCommentInput!) {
        createComment(input: $input) {
            _id
            body
            username
            loopId
        }
    }
`;