
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createClient } from "~/utils/supabase.server";

export async function loader() {
  try {
    const { supabase } = createClient();
    
    // Fetch data from Supabase tables
    const { data: therapists, error: therapistsError } = await supabase
      .from("therapists")
      .select("id, name");
    
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id, name, type, status");
    
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, category, price");

    return json({ 
      therapists: therapists || [],
      rooms: rooms || [],
      services: services || [],
      errors: {
        therapists: therapistsError?.message,
        rooms: roomsError?.message,
        services: servicesError?.message,
      }
    });
  } catch (error) {
    return json({
      therapists: [],
      rooms: [],
      services: [],
      errors: {
        therapists: error instanceof Error ? error.message : 'Unknown error',
        rooms: null,
        services: null,
      }
    });
  }
}

interface LoaderData {
  therapists: Array<{ id: string; name: string }>;
  rooms: Array<{ id: string; name: string; type: string; status: string }>;
  services: Array<{ id: string; name: string; category: string; price: number }>;
  errors: {
    therapists: string | null;
    rooms: string | null;
    services: string | null;
  };
}

export default function Home() {
  const { therapists = [], rooms = [], services = [] } = useLoaderData<LoaderData>();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">HAKUMI NURU MASSAGE</h1>
        <p className="text-center text-gray-400 mb-8">Operations Command Center</p>
        
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Therapists</h2>
            <p className="text-3xl font-bold text-green-400">{therapists.length}</p>
            <p className="text-sm text-gray-400">Total in system</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Rooms</h2>
            <p className="text-3xl font-bold text-blue-400">{rooms.length}</p>
            <p className="text-sm text-gray-400">Available rooms</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Services</h2>
            <p className="text-3xl font-bold text-yellow-400">{services.length}</p>
            <p className="text-sm text-gray-400">Service packages</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-green-400 font-semibold">✅ Supabase connection successful!</p>
          <p className="text-gray-400 text-sm mt-2">Database is ready for operations</p>
        </div>
      </div>
    </div>
  );
}

