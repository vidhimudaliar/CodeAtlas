import { createSupabaseClient } from "./utils/supabase/server";

export interface DatabaseRepository {
  id: string;
  owner: string;
  repo: string;
  title: string;
  created_at: string;
  owner_user_id: string;
  installation_id: number | null;
  default_branch: string | null;
  private: boolean | null;
  last_synced_at: string | null;
}


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


export async function getUserRepositories(
    id: string
): Promise<DatabaseRepository[]> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_user_id', id)

    if (error) {
        throw error;
    }

    const repositories = data
    return repositories ?? [];
}


export default getUserById;
