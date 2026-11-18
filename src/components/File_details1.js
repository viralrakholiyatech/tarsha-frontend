import React from 'react'

const File_details = () => {
  return (
    <div className="content__wrapper">
            <div className="page__header pt-3 position-relative">
                <div className="container-fluid">
                    <h1>Office File No. : 0012344</h1>
                </div>
            </div>
            <section className="py-4">
                <div className="container-fluid">                    
                    <div className="card__wrapper">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card p-3 grey-border rounded">
                                    <ul className="card__category--list">
                                        <li className="card__category--item active d-flex align-content-center mb-3"><span className="d-block rounded-circle grey-bgcolor mr-2"><i className="fas fa-pen"></i></span>File Details</li>
                                        <li className="card__category--item d-flex align-content-center mb-3"><span className="d-block rounded-circle grey-bgcolor mr-2">2</span>Required Document Lists</li>
                                        <li className="card__category--item d-flex align-content-center mb-3"><span className="d-block rounded-circle grey-bgcolor mr-2">3</span>Required Document Lists</li>
                                        <li className="card__category--item d-flex align-content-center mb-3"><span className="d-block rounded-circle grey-bgcolor mr-2">4</span>Required Document Lists</li>
                                        <li className="card__category--item d-flex align-content-center mb-3"><span className="d-block rounded-circle grey-bgcolor mr-2">5</span>Required Document Lists</li>
                                        <li className="card__category--item d-flex align-content-center mb-3"><span className="d-block rounded-circle grey-bgcolor mr-2">6</span>Required Document Lists</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="grey-border rounded">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0 font-weight-normal">File Details</h5>
                                    </div>
                                    <div className="card-body bg-white rounded-bottom p-3">
                                        <form className="">
                                            <div className="row">
                                                <div className="form-group col-md-12">
                                                    <label htmlFor="">SMC Case No/Application ID No</label>
                                                    <input type="text" className="form-control"/>
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="">Village</label>
                                                    <input type="text" className="form-control"/>
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label htmlFor="">Taluka</label>
                                                    <input type="text" className="form-control"/>
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <div className="custom-control custom-radio custom-control-inline">
                                                        <input type="radio" id="rs_no" name="radioField-1" className="custom-control-input"/>
                                                        <label className="custom-control-label" htmlFor="rs_no">R.S No</label>
                                                    </div>
                                                    <div className="custom-control custom-radio custom-control-inline">
                                                        <input type="radio" id="block_no" name="radioField-1" className="custom-control-input" checked="checked"/>
                                                        <label className="custom-control-label" htmlFor="block_no">Block NO</label>
                                                    </div>
                                                    <input type="text" className="form-control mt-2"/>
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <div className="custom-control custom-radio custom-control-inline">
                                                        <input type="radio" id="tika" name="radioField-2" className="custom-control-input"/>
                                                        <label className="custom-control-label" htmlFor="tika">Tika No</label>
                                                    </div>
                                                    <div className="custom-control custom-radio custom-control-inline">
                                                        <input type="radio" id="moje" name="radioField-2" className="custom-control-input" checked="checked"/>
                                                        <label className="custom-control-label" htmlFor="moje">Moje</label>
                                                    </div>
                                                    <input type="text" className="form-control mt-2"/>
                                                </div>
                                                <div className="form-group text-center col-md-12">
                                                    <button type="submit" className="btn text-uppercase">Submit</button>
                                                </div>
                                            </div>
                                        </form>
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

export default File_details