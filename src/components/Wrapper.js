import React, { useEffect } from 'react'
import Header from './../pages/Dashboard/sidebar/Header';
import Sidebar from '../pages/Dashboard/sidebar/Sidebar';
import {Toaster}  from 'react-hot-toast';
import { image2svg, numberCounter } from '../UtilsComponent/UtilFunctions';
// import allStyles from "./admin.module.css";
const Wrapper = (props) => {
 
  return (
    <>
      <Toaster
                position="top-right"
                reverseOrder={false}
            />
            <Sidebar obj={props.obj}></Sidebar>
        <main className={"main__wapper"}>
            <Header headerTitle={props.headerTitle}></Header>
            
            {props.children}

            

        </main>
    </>
  )
}

export default Wrapper;

// <div className={styles.main__wrapper}></div>