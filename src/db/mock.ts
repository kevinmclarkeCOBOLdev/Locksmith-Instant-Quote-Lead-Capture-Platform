import { 
  DEFAULT_TENANT_ID, 
  DEFAULT_QUOTE_RULES, 
  DEFAULT_NOTIFICATION_SETTINGS, 
  DEFAULT_EMAIL_TEMPLATES, 
  DEFAULT_SMS_TEMPLATES 
} from './helpers';

// In-memory data store with realistic demo data
export const memoryStore = {
  tenants: [
    {
      id: DEFAULT_TENANT_ID,
      name: 'Atypikal Locksmith Services',
      businessPhone: '+447700900077',
      businessEmail: 'info@atypikallocksmiths.co.uk',
      quoteRules: DEFAULT_QUOTE_RULES,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      emailTemplates: DEFAULT_EMAIL_TEMPLATES,
      smsTemplates: DEFAULT_SMS_TEMPLATES,
      createdAt: new Date(),
    }
  ],
  users: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      tenantId: DEFAULT_TENANT_ID,
      email: 'admin@atypikallocksmiths.co.uk',
    }
  ],
  leads: [
    {
      id: 'l1',
      tenantId: DEFAULT_TENANT_ID,
      name: 'David Jones',
      phone: '07700 900077',
      email: 'david.jones@example.com',
      postcode: 'SW1A 1AA',
      lat: 51.501,
      lng: -0.142,
      serviceType: 'Locked Out',
      propertyType: 'House',
      urgency: 'Emergency',
      message: 'Locked key inside the kitchen door.',
      status: 'new',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
    },
    {
      id: 'l2',
      tenantId: DEFAULT_TENANT_ID,
      name: 'Sarah Smith',
      phone: '07700 900123',
      email: 'sarah@example.com',
      postcode: 'EC1A 1BB',
      lat: 51.52,
      lng: -0.09,
      serviceType: 'Lock Replacement',
      propertyType: 'Flat',
      urgency: 'Same Day',
      message: 'Need standard cylinder lock replacement.',
      status: 'contacted',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000), // 1 day ago
    },
    {
      id: 'l3',
      tenantId: DEFAULT_TENANT_ID,
      name: 'John Miller',
      phone: '07700 900456',
      email: 'john@miller-offices.co.uk',
      postcode: 'WC1A 1AA',
      lat: 51.518,
      lng: -0.12,
      serviceType: 'Commercial Locksmith',
      propertyType: 'Office',
      urgency: 'Flexible',
      message: 'Quote for building wide locks change.',
      status: 'quoted',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000), // 3 days ago
    },
    {
      id: 'l4',
      tenantId: DEFAULT_TENANT_ID,
      name: 'Emma Watson',
      phone: '07700 900789',
      email: 'emma@example.com',
      postcode: 'W1A 1AA',
      lat: 51.514,
      lng: -0.15,
      serviceType: 'Lost Keys',
      propertyType: 'House',
      urgency: 'Emergency',
      message: 'Lost keys at the tube station.',
      status: 'booked',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), // 5 days ago
    },
    {
      id: 'l5',
      tenantId: DEFAULT_TENANT_ID,
      name: 'Robert Davis',
      phone: '07700 900999',
      email: 'robert@davis-retail.com',
      postcode: 'N1 1AA',
      lat: 51.53,
      lng: -0.11,
      serviceType: 'UPVC Door Lock',
      propertyType: 'Retail',
      urgency: 'Same Day',
      message: 'Front door mechanism jammed.',
      status: 'completed',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000), // 10 days ago
    }
  ],
  quotes: [
    {
      id: 'q1',
      tenantId: DEFAULT_TENANT_ID,
      leadId: 'l1',
      minPrice: '95',
      maxPrice: '140',
      quoteType: 'instant',
    },
    {
      id: 'q2',
      tenantId: DEFAULT_TENANT_ID,
      leadId: 'l2',
      minPrice: '90',
      maxPrice: '180',
      quoteType: 'instant',
    },
    {
      id: 'q3',
      tenantId: DEFAULT_TENANT_ID,
      leadId: 'l3',
      minPrice: '180',
      maxPrice: '420',
      quoteType: 'instant',
    },
    {
      id: 'q4',
      tenantId: DEFAULT_TENANT_ID,
      leadId: 'l4',
      minPrice: '104',
      maxPrice: '195',
      quoteType: 'instant',
    },
    {
      id: 'q5',
      tenantId: DEFAULT_TENANT_ID,
      leadId: 'l5',
      minPrice: '123',
      maxPrice: '227',
      quoteType: 'instant',
    }
  ],
  notifications: [] as any[],
  audit_logs: [] as any[]
};

interface ChainState {
  operation: 'select' | 'insert' | 'update';
  selectFields?: any;
  table?: any;
  values?: any;
  whereConditions: any[];
  leftJoins: { table: any; condition: any }[];
  groupByColumns?: any[];
  orderByColumns?: any[];
  limitValue?: number;
  setValues?: any;
}

function matchCondition(row: any, cond: any): boolean {
  if (!cond) return true;

  // Handle drizzle eq AST
  if (cond.left && cond.left.name) {
    const tblObj = cond.left.table;
    const colKey = tblObj ? Object.keys(tblObj).find(k => tblObj[k] === cond.left) : null;
    const colName = colKey || cond.left.name;
    const expectedValue = cond.right;
    const rowValue = row[colName];
    return String(rowValue) === String(expectedValue);
  }

  // Handle raw sql template / query chunks
  const sqlString = cond.queryChunks ? cond.queryChunks.join(' ') : String(cond);
  
  if (sqlString.includes('booked') || sqlString.includes('completed')) {
    return row.status === 'booked' || row.status === 'completed';
  }

  if (sqlString.includes('created_at') && cond.params) {
    const dateParam = cond.params.find((p: any) => p instanceof Date);
    if (dateParam) {
      return new Date(row.createdAt).getTime() >= dateParam.getTime();
    }
  }

  return true;
}

function matchJoinCondition(joinedRow: any, jRow: any, condition: any): boolean {
  // Always leads to quotes on leadId
  if (joinedRow.leads && jRow.leadId) {
    return joinedRow.leads.id === jRow.leadId;
  }
  return false;
}

async function executeChain(state: ChainState): Promise<any> {
  const tableName = state.table ? (state.table as any)[Symbol.for('drizzle:Name')] : null;
  if (!tableName) {
    throw new Error('Table name not found in query');
  }

  let records = memoryStore[tableName as keyof typeof memoryStore] || [];

  if (state.operation === 'select') {
    // Apply WHERE
    if (state.whereConditions.length > 0) {
      records = records.filter(row => {
        return state.whereConditions.every(cond => matchCondition(row, cond));
      });
    }

    // Apply leftJoin
    let joinedRecords = records.map(row => ({ [tableName]: row }));
    for (const join of state.leftJoins) {
      const joinTableName = (join.table as any)[Symbol.for('drizzle:Name')];
      const joinRecords = memoryStore[joinTableName as keyof typeof memoryStore] || [];
      
      joinedRecords = joinedRecords.map(joinedRow => {
        const match = joinRecords.find(jRow => matchJoinCondition(joinedRow, jRow, join.condition));
        return {
          ...joinedRow,
          [joinTableName]: match || null
        };
      });
    }

    // Apply projection / custom selects
    let results: any[] = [];
    if (state.selectFields) {
      const isCountOnly = state.selectFields.count !== undefined;
      const isAvgValOnly = state.selectFields.avgVal !== undefined;

      if (isCountOnly) {
        results = [{ count: joinedRecords.length }];
      } else if (isAvgValOnly) {
        let sum = 0;
        const quotesTable = memoryStore.quotes;
        const filteredQuotes = state.whereConditions.length > 0 
          ? quotesTable.filter(q => state.whereConditions.every(cond => matchCondition(q, cond)))
          : quotesTable;

        filteredQuotes.forEach(q => {
          sum += (parseInt(q.minPrice) + parseInt(q.maxPrice)) / 2;
        });
        const avgVal = filteredQuotes.length > 0 ? Math.round(sum / filteredQuotes.length) : 0;
        results = [{ avgVal }];
      } else {
        results = joinedRecords.map(joinedRow => {
          const projectedRow: any = {};
          for (const [key, val] of Object.entries(state.selectFields)) {
            if (val && typeof val === 'object') {
              // Check if val is a Table object
              const isTable = (val as any)[Symbol.for('drizzle:Name')] !== undefined;
              if (isTable) {
                const tblName = (val as any)[Symbol.for('drizzle:Name')];
                projectedRow[key] = joinedRow[tblName] || null;
              } else {
                const tblObj = (val as any).table;
                const colKey = tblObj ? Object.keys(tblObj).find(k => tblObj[k] === val) : null;
                const colName = colKey || (val as any).name || key;
                const tblName = tblObj ? tblObj[Symbol.for('drizzle:Name')] : tableName;
                
                if (tblName) {
                  projectedRow[key] = joinedRow[tblName]?.[colName];
                } else {
                  projectedRow[key] = joinedRow[tableName]?.[colName] ?? joinedRow[tableName]?.[key];
                }
              }
            } else {
              projectedRow[key] = joinedRow[tableName]?.[key];
            }
          }
          return projectedRow;
        });
      }
    } else {
      results = records;
    }

    // Apply GROUP BY
    if (state.groupByColumns && state.groupByColumns.length > 0) {
      const groups = new Map<string, any[]>();
      results.forEach(row => {
        // Group by value of first group by column (we know leads.serviceType projects as name)
        const groupKey = row.name || row.serviceType || 'Unknown';
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(row);
      });

      results = Array.from(groups.entries()).map(([name, group]) => ({
        name,
        value: group.length
      }));
    }

    // Apply ORDER BY
    if (state.orderByColumns && state.orderByColumns.length > 0) {
      results.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (a.value !== undefined && b.value !== undefined) {
          return b.value - a.value;
        }
        return 0;
      });
    }

    // Apply LIMIT
    if (state.limitValue !== undefined) {
      results = results.slice(0, state.limitValue);
    }

    // Check if it's monthly chartData select
    if (state.selectFields && (state.selectFields.month || state.selectFields.monthNum)) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthGroups: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mName = months[d.getMonth()];
        monthGroups[mName] = 0;
      }

      records.forEach(r => {
        const date = new Date(r.createdAt || Date.now());
        const mName = months[date.getMonth()];
        if (monthGroups[mName] !== undefined) {
          monthGroups[mName]++;
        }
      });

      results = Object.entries(monthGroups).map(([month, count], index) => ({
        month,
        Leads: count, // match structure from route.ts
        name: month,
      }));
    }

    return results;

  } else if (state.operation === 'insert') {
    const dataToInsert = state.values;
    const items = Array.isArray(dataToInsert) ? dataToInsert : [dataToInsert];
    const insertedItems = items.map(item => {
      const newItem = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        ...item
      };
      records.push(newItem);
      return newItem;
    });

    return insertedItems;

  } else if (state.operation === 'update') {
    const dataToSet = state.setValues;
    const updatedItems: any[] = [];

    records.forEach(row => {
      let matches = true;
      if (state.whereConditions.length > 0) {
        matches = state.whereConditions.every(cond => matchCondition(row, cond));
      }
      if (matches) {
        Object.assign(row, dataToSet);
        updatedItems.push(row);
      }
    });

    return updatedItems;
  }

  return [];
}

function createChain(state: ChainState): any {
  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      if (prop === 'then') {
        return (onfulfilled: any, onrejected: any) => {
          return executeChain(state).then(onfulfilled, onrejected);
        };
      }
      if (prop === 'catch') {
        return (onrejected: any) => {
          return executeChain(state).catch(onrejected);
        };
      }
      if (prop === 'finally') {
        return (onfinally: any) => {
          return executeChain(state).finally(onfinally);
        };
      }

      if (prop === 'from') {
        return (table: any) => createChain({ ...state, table });
      }
      if (prop === 'leftJoin') {
        return (table: any, condition: any) => createChain({
          ...state,
          leftJoins: [...state.leftJoins, { table, condition }]
        });
      }
      if (prop === 'where') {
        return (condition: any) => createChain({
          ...state,
          whereConditions: [...state.whereConditions, condition]
        });
      }
      if (prop === 'groupBy') {
        return (...columns: any[]) => createChain({ ...state, groupByColumns: columns });
      }
      if (prop === 'orderBy') {
        return (...columns: any[]) => createChain({ ...state, orderByColumns: columns });
      }
      if (prop === 'limit') {
        return (val: number) => createChain({ ...state, limitValue: val });
      }
      if (prop === 'values') {
        return (values: any) => createChain({ ...state, values });
      }
      if (prop === 'set') {
        return (values: any) => createChain({ ...state, setValues: values });
      }
      if (prop === 'returning') {
        return () => createChain(state);
      }

      return (...args: any[]) => createChain(state);
    }
  };
  return new Proxy(() => {}, handler);
}

// Export mock db object matching drizzle structure
export const mockDb = {
  select: (fields?: any) => createChain({ operation: 'select', selectFields: fields, whereConditions: [], leftJoins: [] }),
  insert: (table: any) => createChain({ operation: 'insert', table, whereConditions: [], leftJoins: [] }),
  update: (table: any) => createChain({ operation: 'update', table, whereConditions: [], leftJoins: [] }),
};
