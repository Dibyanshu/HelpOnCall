export interface AuditCreateFields {
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditUpdateFields {
  updatedAt: Date;
}

export function buildAuditCreateFields(createdBy = ""): AuditCreateFields {
  const now = new Date();

  return {
    createdBy,
    createdAt: now,
    updatedAt: now
  };
}

export function buildAuditUpdateFields(): AuditUpdateFields {
  return {
    updatedAt: new Date()
  };
}
