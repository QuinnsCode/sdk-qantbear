import { initRealtimeClient } from "@redwoodjs/sdk/realtime/client";

async function setupRealtimeClient() {
  console.log('Initializing Realtime Client');
  console.log('Current Path:', window.location.pathname);

  try {
    await initRealtimeClient({
      key: window.location.pathname,
    });
    console.log('Realtime Client Initialized Successfully');
  } catch (error) {
    console.error('Realtime Client Initialization Error:', error);
  }
}

// Call the async function
setupRealtimeClient();