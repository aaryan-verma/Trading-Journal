const Note = require("../models/Notes");
const mongoose = require("mongoose");
const expressEjsLayouts = require("express-ejs-layouts");

//Get Dashboard

exports.dashboard = async (req, res) => {
    let perPage = 8;
    let page = req.query.page || 1;


    const locals = {
        title: 'Dashboard',
        description: 'Write about your trading goals, mistakes and improvement tips',
    }


    try {

        // const notes = await Note.find({});
        // console.log(notes)
        // console.log(req.user.id)
        // console.log(mongoose.Types.ObjectId(req.user.id.toString()))
        Note.aggregate([
            {
                $sort: {
                    updatedAt: -1,
                }
            },
            {
                $match: { user: mongoose.Types.ObjectId(req.user.id.toString()) }
            },
            {
                $project: {
                    title: { $substr: ['$title', 0, 30] },
                    body: { $substr: ['$body', 0, 100] },
                }
            }

        ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec(function (err, notes) {
                Note.count().exec(function (err, count) {
                    if (err) return next(err);
                    res.render('dashboard/index', {
                        userName: req.user.firstName,
                        locals,
                        notes,
                        layout: '../views/layouts/dashboard',
                        current: page,
                        pages: Math.ceil(count/ perPage)
                    });

                });
            });



    } catch (error) {
        console.log(error);
    }





    // const notes = await Note.find({});

}



// GET 
// VIEW SPECIFIC Note

exports.dashboardViewNote = async (req, res) => {
    const note = await Note.findById({ _id: req.params.id })
      .where({ user: req.user.id })
      .lean();
  
    if (note) {
      res.render("dashboard/view-note", {
        noteID: req.params.id,
        note,
        layout: "../views/layouts/dashboard",
      });
    } else {
      res.send("Something went wrong.");
    }
  };

//   PUT 
//   UPdate specific note

exports.dashboardUpdateNote = async(req, res) =>{
    try{
        await Note.findOneAndUpdate(
            {_id: req.params.id },
            {title: req.body.title, body: req.body.body, updatedAt: Date.now()}
            ).where( { user: req.user.id } );
            res.redirect('/dashboard');
    }
    catch(error) {
        console.log(error);
    }
}


// DELETE Note 

exports.dashboardDeleteNote = async(req, res) =>{
    try{

        await Note.deleteOne({_id: req.params.id}).where({user: req.user.id});
        res.redirect('/dashboard');

    } catch(error){
        console.log(error);
    }

}


//GET Add Note


exports.dashboardAddNote = async(req, res)=>{
    res.render('dashboard/add',{
        layout: '../views/layouts/dashboard'
    });
};


exports.dashboardAddNoteSubmit = async(req, res)=>{
    try{

        req.body.user = req.user.id;
        await Note.create(req.body);
        res.redirect('/dashboard');

    } catch(error){
        console.log(error);
    }
};



// GET Search 

exports.dashboardSearch = async (req, res) => {
    try {
      res.render("dashboard/search", {
        searchResults: "",
        layout: "../views/layouts/dashboard",
      });
    } catch (error) {}
  };
  
  /**
   * POST /
   * Search For Notes
   */
  exports.dashboardSearchSubmit = async (req, res) => {
    try {
      let searchTerm = req.body.searchTerm;
      const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
  
      const searchResults = await Note.find({
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
          { body: { $regex: new RegExp(searchNoSpecialChars, "i") } },
        ],
      }).where({ user: req.user.id });
  
      res.render("dashboard/search", {
        searchResults,
        layout: "../views/layouts/dashboard",
      });
    } catch (error) {
      console.log(error);
    }
  };

