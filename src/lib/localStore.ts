import type {
  Company,
  Contact,
  Document,
  JobApplication,
  Profile,
  Resume,
  WorkExperienceRecord,
} from "@/types";

const KEY = "pathfinder-data-v1";

export interface LocalData {
  profile: Profile | null;
  applications: JobApplication[];
  companies: Company[];
  contacts: Contact[];
  documents: Document[];
  resumes: Resume[];
  workExperience: WorkExperienceRecord[];
}

const empty: LocalData = {
  profile: null,
  applications: [],
  companies: [],
  contacts: [],
  documents: [],
  resumes: [],
  workExperience: [],
};

function load(): LocalData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return { ...empty };
  }
}

function save(data: LocalData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const localStore = {
  get: load,
  set(data: LocalData) {
    save(data);
  },
  update(partial: Partial<LocalData>) {
    const next = { ...load(), ...partial };
    save(next);
    return next;
  },
  uid() {
    let id = localStorage.getItem("pathfinder-local-user");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("pathfinder-local-user", id);
    }
    return id;
  },
};
