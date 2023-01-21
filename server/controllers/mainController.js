// Get homepage

exports.homepage = async(req, res) =>{
    const locals = {
            title: 'Trade Journal',
            description: 'Write about your trading goals, mistakes and improvement tips'
        }
    
        res.render('index', {
            locals,
            layout: '../views/layouts/front-page'
        });
}

//Get About

exports.about = async(req, res) =>{
    const locals = {
            title: 'About - Trade Journal',
            description: 'Write about your trading goals, mistakes and improvement tips'
        }
    
        res.render('about', locals);
}