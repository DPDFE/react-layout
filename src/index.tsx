import * as React from 'react'
import styles from './styles.module.css'

export const ReactDragLayout = () => {
  return (
    <div className={styles.container}>
      <HorizontalRuler></HorizontalRuler>
      <div>
        <VerticalRuler></VerticalRuler>
        <div className={styles.canvas_wrapper}>
          <DrawBoard></DrawBoard>
        </div>
      </div>
    </div>
  )
}
