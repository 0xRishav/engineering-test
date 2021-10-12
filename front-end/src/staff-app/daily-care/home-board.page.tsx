import React, { useState, useEffect } from "react"
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
import { useStudentContext } from "contexts/student-context"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [stateList, setStateList] = useState<StudentRollState[]>([])
  const [getStudents, data, loadState] = useApi<{ students: Student[] }>({ url: "get-homeboard-students" })

  const {
    dispatch,
    state: { rollStateFilter, sortBy, searchInput, sortDirection, sortedAndFilteredStudents, sortedStudents },
  } = useStudentContext()

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (data?.students) {
      dispatch({ type: "SET_SORTED_STUDENTS", payload: { allStudents: data.students } })
      dispatch({ type: "SET_FILTERED_STUDENTS" })
    }
  }, [data, sortBy, sortDirection])

  useEffect(() => {
    dispatch({ type: "SET_FILTERED_STUDENTS" })
  }, [searchInput, rollStateFilter])

  useEffect(() => {
    setStateList([
      { type: "all", count: sortedStudents.length },
      { type: "present", count: [...sortedStudents].filter((s) => s.rollState === "present").length },
      { type: "late", count: [...sortedStudents].filter((s) => s.rollState === "late").length },
      { type: "absent", count: [...sortedStudents].filter((s) => s.rollState === "absent").length },
    ])
  }, [sortedStudents])

  const filterStateChangeHandler = (type: RollStateFilterType) => {
    dispatch({ type: "SET_ROLL_STATE_FILTER", payload: { type: type } })
  }

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
    if (action === "sort") {
      dispatch({ type: "CHANGE_SORT_BY" })
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
      dispatch({ type: "SET_ROLL_STATE_FILTER", payload: { type: null } })
    }
  }

  const studentSearchHandler = (e: React.FormEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_SEARCH_INPUT", payload: { searchInput: e.currentTarget.value } })
  }

  const sortDirectionHandler = () => {
    dispatch({ type: "CHANGE_SORT_DIRECTION" })
  }

  const rollStateChangeHandler = (next: RolllStateType, id: number) => {
    const index = sortedStudents.findIndex((s) => s.id === id)
    const newStudents = [...sortedStudents]
    newStudents[index].rollState = next
    dispatch({ type: "SET_SORTED_STUDENTS", payload: { allStudents: [...newStudents] } })
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
