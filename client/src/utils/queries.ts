import { gql } from "@apollo/client";

export const QUERY_USER = gql`
    query user($username: String!) {
        user(username: $username) {
        _id
        username
        email
        loops {
            _id
            title
            frames {
                frameId
                canvasImg
                }
            }
        }
    }
`;

export const QUERY_ME = gql`
    query me {
        me {
            _id
            username
            email
            loops {
                _id
                title
                frames {
                    frameId
                    canvasImg
                }
            }
        }
    }
`;

// export const QUERY_LOOPS = gql`
//  query loop(id: $id) {
//     id
//     title
//     frames {
//         id
//         canvasImg
//         data
//     }
//  }
// `;

export const GET_LOOPS = gql`
query GetLoops {
    getLoops {
        _id
        title
        createdAt
        likeCount
        likes {
            userId
        }
        frames {
            frameId
            canvasImg
        }
        comments {
            _id
            username
            body
        }
    }
}
`;

export const GET_USER_BY_LOOP = gql`
query GetUserByLoop($_id: ID!) {
    getUserByLoop(_id: $_id) {
        username
    }
}
`;

export const GET_COMMENTS_BY_LOOP = gql`
    query GetCommentsByLoop($id: ID!) {
        getCommentsByLoop(_id: $id) {
            _id
            body
            username
        }
    }
`;