import React, { useEffect } from 'react'

const Profile_details = () => {


  return (
    <>
      <div className="content__wrapper">
            <div className="page__header pt-3 position-relative">
                <div className="container-fluid">
                    <h1>Profile Details</h1>
                </div>
            </div>
            <section className="py-4">
                <div className="container-fluid">                    
                    <div className="card__wrapper">
                        <div className="row">
                            <div className="col-md-3">
                                <div className="card p-4 grey-border rounded">
                                    <div className="user__details text-center">
                                        <div className="user__profile">
                                            <div className="user__profile--img">
                                                <img className="rounded-circle" src="https://webapp.zaidexceldesign.com/public/img/user.jpg" alt="Hardik Sorathiya"/>
                                            </div>
                                            <div className="user__profile--edit">
                                                <a href="#"><img src="https://webapp.zaidexceldesign.com/public/img/edit.svg" alt="Edit"/></a>
                                            </div>
                                        </div>
                                        <div className="user__profile--details mt-4">
                                            <h4>Hardik Sorathiya</h4>
                                            <h5>Structural Engineer</h5>
                                            <hr/>
                                            <ul className="user__profile--contact list-unstyled mb-0">
                                                <li>
                                                    <a href="mail-to: hello@tiltwithit.com">hello@tiltwithit.com</a>
                                                </li>
                                                <li>
                                                    <a href="tel: 9638242404">9638242404</a>
                                                </li>
                                            </ul>
                                            <hr/>
                                            <ul className="user__profile--data list-unstyled mb-0">
                                                <li>Projects (3)</li>
                                                <li>Personal Docs</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-9">
                                <div className="card grey-border rounded">
                                    <div className="user__list--details">
                                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link active" id="tasks-tab" data-toggle="tab" href="#tasks" role="tab" aria-controls="tasks" aria-selected="true">Tasks</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="attendance-tab" data-toggle="tab" href="#attendance" role="tab" aria-controls="attendance" aria-selected="false">Attendance</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="performance-tab" data-toggle="tab" href="#performance" role="tab" aria-controls="performance" aria-selected="false">Performance</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="projects-tab" data-toggle="tab" href="#projects" role="tab" aria-controls="projects" aria-selected="false">Projects</a>
                                            </li>
                                        </ul>
                                        <div className="tab-content" id="myTabContent">
                                            <div className="tab-pane fade show active p-3" id="tasks" role="tabpanel" aria-labelledby="tasks-tab">
                                                <div className="user__list--table">
                                                    <div className="tabe table-bordered table-responsive">
                                                        <table className="table">
                                                            <thead>
                                                                <tr>
                                                                    <th width="13%">Date</th>
                                                                    <th width="27%">Today’s Tasks</th>
                                                                    <th width="10%">Status</th>
                                                                    <th width="20%">Project name</th>
                                                                    <th width="20%">Reason</th>
                                                                    <th width="10%">Feedback</th>
                                                                    <th><i className="fas fa-sliders-v"></i></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>9 / 9 /21</td>
                                                                    <td>Get plot layout papersfrom abc client</td>
                                                                    <td className="incomplete">Incomplete</td>
                                                                    <td>Hemat Kapadia</td>
                                                                    <td>Client was not available</td>
                                                                    <td colspan="2">
                                                                        <a href="#" className="btn response__btn">Response button</a>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>9 / 9 /21</td>
                                                                    <td>Get plot layout papersfrom abc client</td>
                                                                    <td className="complete">Complete</td>
                                                                    <td>Hemat Kapadia</td>
                                                                    <td>-</td>
                                                                    <td colspan="2">Good Work</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="tab-pane fade p-3" id="attendance" role="tabpanel" aria-labelledby="attendance-tab">...</div>
                                            <div className="tab-pane fade p-3" id="performance" role="tabpanel" aria-labelledby="performance-tab">...</div>
                                            <div className="tab-pane fade p-3" id="projects" role="tabpanel" aria-labelledby="projects-tab">...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>  

        

    </>
  )
}

export default Profile_details;