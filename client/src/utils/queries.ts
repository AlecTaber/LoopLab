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
    userId
    title
    frames {
      frameId
      canvasImg
    }
  }
}
`;