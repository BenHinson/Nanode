import React, {useState, useContext} from 'react';
import { Link } from "react-router-dom";

import { UserContext } from "../../../state/context/UserContext.react";

export default function UserStorage() {
  const { userStorage } = useContext(UserContext);

  return (
    <div className='Storage'>
      <p>{userStorage.converted.used} / {userStorage.converted.max}</p>
      <progress value={userStorage.converted.percentage} max="100" ></progress>
    </div>
  )
}