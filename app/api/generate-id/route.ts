export async function POST(request: Request) {
    try {
      const { id, action } = await request.json();
  
      if (!id || !action) {
        return new Response(
          JSON.stringify({ error: 'ID and action are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      if (action === 'mask') {
        // Encode the ID to Base64
        const maskedID = Buffer.from(id.toString()).toString("base64");
        return new Response(
          JSON.stringify({ maskedID }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (action === 'unmask') {
        // Decode the Base64 back to the original ID
        const unmaskedID = Buffer.from(id, 'base64').toString('ascii');
        return new Response(
          JSON.stringify({ unmaskedID }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use "mask" or "unmask".' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Something went wrong.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }