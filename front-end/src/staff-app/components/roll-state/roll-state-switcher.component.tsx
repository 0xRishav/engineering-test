import React, { useEffect, useState } from "react"
import { RolllStateType, StudentRollState, RollStateFilterType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType, studentId: number) => void
  studentId: number
  stateList: StudentRollState[]
  rollStateProp: RolllStateType | null
}
export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, onStateChange, stateList, studentId, rollStateProp }) => {
  const [rollState, setRollState] = useState(initialState)

  useEffect(() => {
    if (rollStateProp === null) {
      setRollState(initialState)
    } else {
      setRollState(rollStateProp)
    }
  }, [])

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState()
    console.log(next)
    setRollState(next)
    if (onStateChange) {
      onStateChange(next, studentId)
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
