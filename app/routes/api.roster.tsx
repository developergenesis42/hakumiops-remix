import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getRoster, getAvailableRosterTherapists } from "~/utils/database.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Temporarily disable auth for development - change back to requireAuth for production
  // await requireAuth(request);
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
      console.error('Roster API error:', result.error);
      return json({ error: result.error }, { status: 500 });
    }
    
    // If roster is empty, return the master roster list as fallback
    if (result.data.length === 0) {
      const masterRosterData = [
        { id: 1, name: 'Ally', vip_number: 1, is_active: true },
        { id: 2, name: 'Anna', vip_number: 2, is_active: true },
        { id: 3, name: 'Audy', vip_number: 3, is_active: true },
        { id: 4, name: 'Ava', vip_number: 4, is_active: true },
        { id: 5, name: 'BB', vip_number: 5, is_active: true },
        { id: 6, name: 'Beer-male', vip_number: 6, is_active: true },
        { id: 7, name: 'Bella', vip_number: 7, is_active: true },
        { id: 8, name: 'Bowie', vip_number: 8, is_active: true },
        { id: 9, name: 'Candy', vip_number: 9, is_active: true },
        { id: 10, name: 'Cherry', vip_number: 10, is_active: true },
        { id: 11, name: 'Cookie', vip_number: 11, is_active: true },
        { id: 12, name: 'Diamond', vip_number: 12, is_active: true },
        { id: 13, name: 'Emmy', vip_number: 13, is_active: true },
        { id: 14, name: 'Essay', vip_number: 14, is_active: true },
        { id: 15, name: 'Gina', vip_number: 15, is_active: true },
        { id: 16, name: 'Hana', vip_number: 16, is_active: true },
        { id: 17, name: 'IV', vip_number: 17, is_active: true },
        { id: 18, name: 'Irin', vip_number: 18, is_active: true },
        { id: 19, name: 'Jenny', vip_number: 19, is_active: true },
        { id: 20, name: 'Kana', vip_number: 20, is_active: true },
        { id: 21, name: 'Kira', vip_number: 21, is_active: true },
        { id: 22, name: 'Kitty', vip_number: 22, is_active: true },
        { id: 23, name: 'Lita', vip_number: 23, is_active: true },
        { id: 24, name: 'Lucky', vip_number: 24, is_active: true },
        { id: 25, name: 'Luna', vip_number: 25, is_active: true },
        { id: 26, name: 'Mabel', vip_number: 26, is_active: true },
        { id: 27, name: 'Mako', vip_number: 27, is_active: true },
        { id: 28, name: 'Maria', vip_number: 28, is_active: true },
        { id: 29, name: 'Micky', vip_number: 29, is_active: true },
        { id: 30, name: 'Miku', vip_number: 30, is_active: true },
        { id: 31, name: 'Mimi', vip_number: 31, is_active: true },
        { id: 32, name: 'Mina', vip_number: 32, is_active: true },
        { id: 33, name: 'Nabee', vip_number: 33, is_active: true },
        { id: 34, name: 'Nana', vip_number: 34, is_active: true },
        { id: 35, name: 'Nicha', vip_number: 35, is_active: true },
        { id: 36, name: 'Oily', vip_number: 36, is_active: true },
        { id: 37, name: 'Palmy', vip_number: 37, is_active: true },
        { id: 38, name: 'Rosy', vip_number: 38, is_active: true },
        { id: 39, name: 'Sara', vip_number: 39, is_active: true },
        { id: 40, name: 'Shopee', vip_number: 40, is_active: true },
        { id: 41, name: 'Sophia', vip_number: 41, is_active: true },
        { id: 42, name: 'Sunny', vip_number: 42, is_active: true },
        { id: 43, name: 'Susie', vip_number: 43, is_active: true },
        { id: 44, name: 'Tata', vip_number: 44, is_active: true },
        { id: 45, name: 'Violet', vip_number: 45, is_active: true },
        { id: 46, name: 'Yuki', vip_number: 46, is_active: true },
        { id: 47, name: 'Yuri', vip_number: 47, is_active: true }
      ];
      
      // Filter out excluded names if any
      const filteredData = excludeNames.length > 0 
        ? masterRosterData.filter(therapist => !excludeNames.includes(therapist.name))
        : masterRosterData;
      
      return json({ data: filteredData });
    }
    
    return json({ data: result.data });
  } catch (error) {
    console.error('Error in roster loader:', error);
    return json({ error: 'Failed to fetch roster data' }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  // Temporarily disable auth for development - change back to requireAuth for production
  // await requireAuth(request);
  
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
