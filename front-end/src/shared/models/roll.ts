export interface Roll {
  id: number
  name: string
  completed_at: Date
  student_roll_states: { student_id: number; roll_state: RolllStateType }[]
}

export interface RollInput {
  student_roll_states: { student_id: number; roll_state: RolllStateType }[]
}

export type StudentRollState = { type: "all" | "present" | "absent" | "late"; count: number }

export type RollStateFilterType = RolllStateType | "all"

export type StateList = StudentRollState[] | []

export type RolllStateType = "unmark" | "present" | "absent" | "late"
