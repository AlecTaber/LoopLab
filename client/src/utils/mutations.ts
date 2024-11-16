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
  mutation SaveLoop($title: String!, $frames: [FrameInput!]!) {
    saveLoop(title: $title, frames: $frames) {
      _id
      title
      frames {
        frameId
        canvasImg
      }
    }
  }
`;