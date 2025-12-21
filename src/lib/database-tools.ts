// PiPilot DB Integration Functions
// Note: These are placeholder implementations. In a real PiPilot environment,
// these would be imported from the PiPilot SDK or API client.

import { create_database as _create_database } from '../../tools/create_database';
import { create_table as _create_table } from '../../tools/create_table';
import { list_tables as _list_tables } from '../../tools/list_tables';
import { read_table as _read_table } from '../../tools/read_table';
import { query_database as _query_database } from '../../tools/query_database';
import { manipulate_table_data as _manipulate_table_data } from '../../tools/manipulate_table_data';
import { manage_api_keys as _manage_api_keys } from '../../tools/manage_api_keys';

// Re-export all database functions
export const create_database = _create_database;
export const create_table = _create_table;
export const list_tables = _list_tables;
export const read_table = _read_table;
export const query_database = _query_database;
export const manipulate_table_data = _manipulate_table_data;
export const manage_api_keys = _manage_api_keys;