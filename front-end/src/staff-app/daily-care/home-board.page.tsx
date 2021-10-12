import React, { useState, useEffect, useMemo, useCallback } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Student } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { SortDirection, SortBy } from "shared/models/sort"
import { FaSortAlphaDown, FaSortAlphaDownAlt } from "react-icons/fa"
import { RolllStateType, StudentRollState, RollStateFilterType } from "shared/models/roll"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [searchInput, setSearchInput] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<SortDirection>("ASC")
  const [sortBy, setSortBy] = useState<SortBy>("first_name")
  const [sortedAndFilteredStudents, setSortedAndFilteredStudents] = useState<Student[]>([])
  const [stateList, setStateList] = useState<StudentRollState[]>([])
  const [rollStateFilter, setRollStateFilter] = useState<RollStateFilterType | null>(null)
  const [sortedStudents, setSortedStudents] = useState<Student[]>([])
  const [getStudents, data, loadState] = useApi<{ students: Student[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (data?.students) {
      const tempSortedStudents: Student[] = getSortedStudents(data.students)
      setSortedStudents(tempSortedStudents)
      setSortedAndFilteredStudents(tempSortedStudents)
    }
  }, [data, sortBy, sortDirection])

  useEffect(() => {
    const searchedStudents = getSearchedStudents(sortedStudents, searchInput)
    const filteredStudents = getFilteredStudents(searchedStudents, rollStateFilter)
    setSortedAndFilteredStudents(filteredStudents)
  }, [searchInput, rollStateFilter])

  useEffect(() => {
    setStateList([
      { type: "all", count: sortedStudents.length },
      { type: "present", count: [...sortedStudents].filter((s) => s.rollState === "present").length },
      { type: "late", count: [...sortedStudents].filter((s) => s.rollState === "late").length },
      { type: "absent", count: [...sortedStudents].filter((s) => s.rollState === "absent").length },
    ])
  }, [sortedStudents])

  /* Function to get sorted students */

  const getSortedStudents = useCallback(
    (students: Student[]): Student[] => {
      return sortDirection === "ASC"
        ? [...students].sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1
            if (a[sortBy] > b[sortBy]) return 1
            return 0
          })
        : [...students].sort((a, b) => {
            if (a[sortBy] > b[sortBy]) return -1
            if (a[sortBy] < b[sortBy]) return 1
            return 0
          })
    },
    [sortBy, sortDirection]
  )

  /* Function to get filtered students */

  const getFilteredStudents = useCallback(
    (students: Student[], type: RollStateFilterType | null) => {
      if (type && type !== "all") {
        return [...students].filter((s) => s.rollState === type)
      } else {
        return students
      }
    },
    [sortedStudents, rollStateFilter]
  )

  /* Function to get searched students */

  const getSearchedStudents = useCallback(
    (students: Student[], searchQuery: string) => {
      if (searchQuery !== "") {
        return [...students].filter((student) => (student.first_name + " " + student.last_name).toLowerCase().includes(searchInput.toLowerCase()))
      } else {
        return students
      }
    },
    [sortedStudents, searchInput]
  )

  const filterStateChangeHandler = (type: RollStateFilterType) => {
    setRollStateFilter(type)
  }

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
    if (action === "sort") {
      sortBy === "first_name" ? setSortBy("last_name") : setSortBy("first_name")
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
      setRollStateFilter(null)
    }
  }

  const studentSearchHandler = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchInput(e.currentTarget.value)
  }

  const sortDirectionHandler = () => {
    sortDirection === "ASC" ? setSortDirection("DESC") : setSortDirection("ASC")
  }

  const rollStateChangeHandler = (next: RolllStateType, id: number) => {
    const index = sortedStudents.findIndex((s) => s.id === id)
    const newStudents = [...sortedStudents]
    newStudents[index].rollState = next
    setSortedStudents([...newStudents])
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar
          onItemClick={onToolbarAction}
          sortBy={sortBy}
          searchInput={searchInput}
          studentSearchHandler={studentSearchHandler}
          sortDirectionHandler={sortDirectionHandler}
          sortDirection={sortDirection}
        />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {sortedAndFilteredStudents.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} rollStateChangeHandler={rollStateChangeHandler} stateList={stateList} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} stateList={stateList} filterStateChangeHandler={filterStateChangeHandler} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  studentSearchHandler: (e: React.FormEvent<HTMLInputElement>) => void
  searchInput: string
  sortBy: string
  sortDirectionHandler: () => void
  sortDirection: SortDirection
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, searchInput, studentSearchHandler, sortBy, sortDirectionHandler, sortDirection } = props
  return (
    <S.ToolbarContainer>
      <S.SortContainer>
        <S.SortTitle onClick={() => onItemClick("sort")}>{sortBy === "first_name" ? `First Name` : `Last Name`}</S.SortTitle>

        <S.SortDirectionContainer onClick={sortDirectionHandler}>{sortDirection === "ASC" ? <FaSortAlphaDown /> : <FaSortAlphaDownAlt />}</S.SortDirectionContainer>
      </S.SortContainer>

      <input type="text" onChange={(e) => studentSearchHandler(e)} value={searchInput} placeholder="Search Students Here" />
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  SortTitle: styled.div`
    cursor: pointer;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  SortContainer: styled.div`
    display: flex;
    align-item: center;
    justify-content: space-between;
    min-width: 15%;
  `,
  SortDirectionContainer: styled.div`
    cursor: pointer;
  `,
}
