export const callRPC = async (method: string, params: any) => {
  try {
    const response = await fetch(`http://localhost:3015/api/v1/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (error) {
    console.error('RPC call failed:', error);
    throw error;
  }
};

export const client = {
  call: callRPC,
  get: (url: string) => callRPC('GET', { url }),
  post: (url: string, data: any) => callRPC('POST', { url, data }),
  put: (url: string, data: any) => callRPC('PUT', { url, data }),
  delete: (url: string) => callRPC('DELETE', { url })
};
