import { Dispatch } from "react"
import { SortDirection, SortBy } from "shared/models/sort"
import { RollStateFilterType } from "shared/models/roll"
import { Student } from "shared/models/person"

export type Action =
  | { type: "SET_SORTED_STUDENTS"; payload: { allStudents: Student[] } }
  | { type: "SET_FILTERED_STUDENTS" }
  | { type: "SET_ROLL_STATE_FILTER"; payload: { type: RollStateFilterType | null } }
  | { type: "SET_SEARCH_INPUT"; payload: { searchInput: string } }
  | { type: "CHANGE_SORT_BY" }
  | { type: "CHANGE_SORT_DIRECTION" }
  | { type: "CREATE_ROLL_SNAPSHOT"; payload: { snapshot: Student[] } }

export interface InitialState {
  sortDirection: SortDirection
  searchInput: string
  sortBy: SortBy
  sortedAndFilteredStudents: Student[]
  rollStateFilter: RollStateFilterType | null
  sortedStudents: Student[]
  rollSnapShot: Student[]
}

export type StudentContextType = {
  state: InitialState
  dispatch: Dispatch<Action>
}
