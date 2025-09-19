import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getRoster, getAvailableRosterTherapists } from "~/utils/database.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const excludeNames = url.searchParams.get('exclude')?.split(',') || [];
    
    let result;
    if (excludeNames.length > 0) {
      result = await getAvailableRosterTherapists(excludeNames);
    } else {
      result = await getRoster();
    }
    
    if (result.error) {
      return json({ error: result.error }, { status: 500 });
    }
    
    return json({ data: result.data });
  } catch (error) {
    console.error('Error in roster loader:', error);
    return json({ error: 'Failed to fetch roster data' }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  try {
    const body = await request.json();
    const { action: actionType } = body;
    
    switch (actionType) {
      case 'get_available':
        const { excludeNames = [] } = body;
        const result = await getAvailableRosterTherapists(excludeNames);
        
        if (result.error) {
          return json({ error: result.error }, { status: 500 });
        }
        
        return json({ data: result.data });
        
      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in roster action:', error);
    return json({ error: 'Failed to process roster request' }, { status: 500 });
  }
}
