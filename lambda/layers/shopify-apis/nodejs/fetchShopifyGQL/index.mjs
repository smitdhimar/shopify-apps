import axios from 'axios';

export const fetchShopifyGql = async (
  storeName,
  query,
  adminApiAccessToken,
  vars,
) => {
  try {
    const response = await axios({
      url: `https://${storeName}.myshopify.com/admin/api/2024-07/graphql.json`, // Adjust API version as needed
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminApiAccessToken,
      },
      data: JSON.stringify({
        query,
        variables: { ...vars },
      }),
    });
    console.log('response', response);
    return response;
  } catch (error) {
    console.log('error', error);
    console.log('error', JSON.stringify(error));
  }
};
