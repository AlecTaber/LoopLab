import './App.css';
import NavBar from './components/navbar';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import { Outlet } from 'react-router-dom';
// import { Cloudinary } from '@cloudinary/url-gen';
// import { AdvancedImage } from '@cloudinary/react';
// import { fill } from '@cloudinary/url-gen/actions/resize';

const httpLink = createHttpLink({
 uri: '/graphql', 
});

const authLink = setContext((_, {headers}) => {
  const token = localStorage.getItem('id_token');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

function App() {

  // const cld = new Cloudinary({
  //   cloud: {
  //      cloudName: import.meta.env.VITE_CLOUDINARY_NAME || 'default-cloud-name',
  //     // cloudName: 'dxdq51xth',
  //   },
  // });

  // const myImage = cld.image('sample');
  // myImage.resize(fill().width(250).height(250));

  return (
    <ApolloProvider client={client}>
      <div>
        <NavBar />
        <div>
          <Outlet />
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
