import { createSupabaseClient } from "./utils/supabase/server";


/**
 * Fetch a user by id from the "users" table.
 * Defaults to the provided id: 9d926bf1-1579-47f3-8304-28efeb3e074a
 */
export async function getUserById(
    id: string = '9d926bf1-1579-47f3-8304-28efeb3e074a'
): Promise<Record<string, any> | null> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        // rethrow so callers can handle/log as needed
        throw error;
    }

    return data;
}


export default getUserById;