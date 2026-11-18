import React from 'react'

const Elements = () => {
  return (
    <div className="content__wrapper">
            <div className="page__header pt-3 position-relative">
                <div className="container-fluid">
                    <h1>Elements</h1>
                </div>
            </div>
            <section className="py-4">
                <div className="container-fluid">
                    <div className="card p-4">
                        <div className="mb-5">
                            <h4>Buttons</h4>
                            <a href="#" className="btn btn__primary">Primary button</a>
                            <a href="#" className="btn btn__outline">Outline button</a>
                            <a href="#" className="btn grey__outline">Grey button</a>
                            <a href="#" className="btn btn__lg">Large button</a>
                        </div>
                        <div className="mb-5">
                            <h4>Checkbox and Radio Button</h4>
                            <div className="form-group mb-2">
                                <div className="custom-control custom-radio custom-control-inline">
                                    <input type="radio" id="rs_no" name="radioField-1" className="custom-control-input"/>
                                    <label className="custom-control-label" htmlFor="rs_no">Radio Button</label>
                                </div>
                            </div>

                            <div className="form-group mb-2">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="customCheck1"/>
                                    <label className="custom-control-label" htmlFor="customCheck1">Check this custom checkbox</label>
                                </div>
                            </div>
                        </div>
                        <div className="mb-5">
                            <h4>Table</h4>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead className="grey__head">
                                        <tr>
                                            <th>Date</th>
                                            <th>Today’s Tasks</th>
                                            <th>Status</th>
                                            <th>Project name</th>
                                            <th>Checklist</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>9 / 9 /21</td>
                                            <td>Get plot layout papersfrom abc client</td>
                                            <td className="incomplete">Incomplete</td>
                                            <td>Hemat Kapadia</td>
                                            <td className="text-center">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" id="customCheck-1"/>
                                                    <label className="custom-control-label" htmlFor="customCheck-1"></label>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>9 / 9 /21</td>
                                            <td>Get plot layout papersfrom abc client</td>
                                            <td className="incomplete">Incomplete</td>
                                            <td>Hemat Kapadia</td>
                                            <td className="text-center">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" id="customCheck-2"/>
                                                    <label className="custom-control-label" htmlFor="customCheck-2"></label>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mb-5">
                            <h4>Modal</h4>
                            <a href="#" className="btn btn__primary" data-toggle="modal" data-target="#smModal">Click to show small Modal Popup</a>
                            <div className="modal fade" id="smModal" tabindex="-1" role="dialog">
                                <div className="modal-dialog modal-dialog-centered" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header border-0">
                                            <a href="javascript: void(0);" className="close" data-dismiss="modal" aria-label="Close">
                                                <i className="far fa-times-circle"></i>
                                            </a>
                                        </div>
                                        <div className="modal-body">
                                            <p className="text-center font-weight-bold">You have successfully assigned task!</p>
                                        </div>
                                        <div className="modal-footer justify-content-center border-0">
                                            <a href="#" className="btn grey__outline">Assign another task</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <a href="#" className="btn btn__primary" data-toggle="modal" data-target="#lgModal">Click to show large Modal Popup</a>
                            <div className="modal fade" id="lgModal" tabindex="-1" role="dialog">
                                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header border-0">
                                            <a href="javascript: void(0);" className="close" data-dismiss="modal" aria-label="Close">
                                                <i className="far fa-times-circle"></i>
                                            </a>
                                        </div>
                                        <div className="modal-body">
                                            <p className="text-center font-weight-bold">You have successfully assigned task!</p>
                                        </div>
                                        <div className="modal-footer justify-content-center border-0">
                                            <a href="#" className="btn grey__outline">Assign another task</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <a href="#" className="btn btn__primary" data-toggle="modal" data-target="#xlModal">Click to show  extra large Modal Popup</a>
                            <div className="modal fade" id="xlModal" tabindex="-1" role="dialog">
                                <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header border-0">
                                            <a href="javascript: void(0);" className="close" data-dismiss="modal" aria-label="Close">
                                                <i className="far fa-times-circle"></i>
                                            </a>
                                        </div>
                                        <div className="modal-body">
                                            <p className="text-center font-weight-bold">You have successfully assigned task!</p>
                                        </div>
                                        <div className="modal-footer justify-content-center border-0">
                                            <a href="#" className="btn grey__outline">Assign another task</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
  )
}

export default Elements;