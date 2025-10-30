import postgres from 'postgres';
import { config  } from "../config/env.config.js";

const connectionString = config.supabase.database_url;
const sql = postgres(connectionString);

export default sql;