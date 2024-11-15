import { gql } from "@apollo/client";

export const QUERY_USER = gql`
    query user($username: String!) {
        user(username: $username) {
        _id
        username
        email
        }
    }
`;

export const QUERY_ME = gql`
    query me {
        me {
            _id
            username
            email
        }
    }
`;

export const QUERY_LOOPS = gql`
 query loop(id: $id) {
    id
    title
    frames {
        id
        canvasImg
        data
    }
 }
`;