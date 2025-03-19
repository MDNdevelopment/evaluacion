export interface Company {
  id: string;
  logo_url?: string;
  name: string;
  owner_user_id: string;
  created_at: string;
}

export interface Position {
  id: number;
  name: string;
  company_id: string;
  departmentName: string;
  departmentId: string;
}

export interface Question {
  id: number;
  text: string;
  company_id: string;
  positions: {
    id: number;
    name: string;
  }[];
  tags: {
    tag: string;
    id: number;
  }[];
}
