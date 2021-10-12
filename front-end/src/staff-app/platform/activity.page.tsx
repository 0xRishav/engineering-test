import React from "react"
import styled from "styled-components"
import { Spacing } from "shared/styles/styles"
import { useStudentContext } from "contexts/student-context"
import { ActivityStudentListTile } from "staff-app/components/student-list-tile/activity-student-list-tile"
import { Student } from "shared/models/person"

export const ActivityPage: React.FC = () => {
  const {
    state: { rollSnapShot },
  } = useStudentContext()
  return (
    <S.Container>
      <h1>Activity</h1>
      {rollSnapShot.length === 0 ? (
        <S.LargeText>No roll snapshot yet</S.LargeText>
      ) : (
        rollSnapShot.map((student: Student) => <ActivityStudentListTile key={student.id} student={student} />)
      )}
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
  `,
  LargeText: styled.text`
    font-size: 2rem;
  `,
}
