import React from 'react';
import Dropzone from 'react-dropzone';
import _ from 'lodash';
import request from 'superagent';
import classNames from 'classnames';
import toastr from 'toastr';
//import '/node_modules/toastr/build/toastr.css'
import moment from 'moment';
import 'superagent-django-csrf';


export default class SearchableImage extends React.Component{
    constructor(){
        super();

        this.state = {filterText : ''};
    }
    handleUserInput(filterText){
        this.setState({filterText: filterText});
    }

    render(){
        return (
            <div className="upload-div">

                <SearchBar filterText={this.state.filterText}
                onUserInput={this.handleUserInput.bind(this)} 
                />

                <UploadDiv data={this.props.data} addImage={this.props.addImage}
                filterText={this.state.filterText} changeImage={this.props.changeImage}
                />
            </div>

            );
    }
}
class SearchBar extends React.Component{


    handleChange(){
            this.props.onUserInput(
            this.refs.filter.value
        )

    }
    render(){
        return (
            <form className="form">
              <div className="form-group">
                <div className="input-group">
                
                  <input type="text" className="form-control" 
                    placeholder="Search your pictures..." 
                    ref="filter"
                    value= {this.props.filterText}
                    onChange= {this.handleChange.bind(this)}
                    />
                  <div className="input-group-addon"><i className="mdi mdi-magnify"></i></div>
                </div>
              </div>
            </form>
            );
    }
}

class UploadDiv extends React.Component{

    componentWillMount() {
       this.setState({activeKey: 'default',
       isUploading: false,
       percentage:1,
       preview:'',
       filename:''});
          
    }
    changeActiveKey(key,image){
        this.setState({activeKey: key});
        this.props.changeImage(image);
    }
    onDrop(files) {
        let url = document.querySelector("meta[name='image_url']").getAttribute('content');
        
        
        files.forEach((file)=> {
            this.setState({filename: file.name})
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                this.setState({preview: e.target.result});
            }
            request.post(url)
            .attach("image", file, file.name)
            .set('Accept', 'application/json')
            .on('progress',(e)=>{
                console.log(e.percent, file.name, e);
                this.setState({percentage: e.percent,isUploading: true});

            })
            .end((err, res) => {
                this.setState({isUploading: false});
                if(err){
                    console.log(res)
                    return toastr.error(res.body,'unable to upload ' + file.name,{closeButton:true});
                }
                
                toastr.success("successfully uploaded " + file.name,'',{closeButton: true});
                this.props.addImage(res.body);

            })
        });
        
    }

    render(){
        let sections = [];
        let data = this.props.data;
        let dropzone = (<div ref="progresszone" className="dropzone text-center">
            <Dropzone ref="dropzone" className="drop" onDrop={this.onDrop.bind(this)} accept="image/*">
            <div >
                    <h5>Click or drop your images here</h5>
                    <ProgressBar percentage={this.state.percentage || '100'} filename={this.state.filename} preview={this.state.preview} isUploading={this.state.isUploading}/>
                
                </div>
            </Dropzone>
            </div>);
        if(data.length<1){
            return(
                <div className="upload-img"> <div className="uploaded"> 
                <h5> You dont have any images yet </h5></div>
                {dropzone}
                </div>
                );
        }
        data.forEach(function(image,i){
            if(image.title.toLowerCase().indexOf(this.props.filterText.toLowerCase()) == -1) return;

            sections.push(
                <SectionDiv key={i} getKey={image.id} image={image} activeKey={this.state.activeKey} 
                changeKey={this.changeActiveKey.bind(this)} />);
        }.bind(this));
        if(sections.length < 1){
        return(
          
            <div className="upload-img"> <div className="uploaded"> <h5> No Images matches your criteria </h5></div>
            {dropzone}
            </div>

            
            )
           }
           else {
            return (
            <div className="upload-img">{sections}
            {dropzone}
            </div>);
        }

        
    }
}

class SectionDiv extends React.Component{

    
    handleChange(e){
        e.preventDefault();

        this.props.changeKey(this.props.getKey, this.props.image);
    }
    render(){
        var activeUpload = classNames({
                'uploaded': true,
                'active': this.props.getKey == this.props.activeKey
            });
        return(
                <div className={activeUpload} onClick={this.handleChange.bind(this)}>
                <div className="media">
                    <a className="media-left" href="#" >
                    <img className="media-object" src={`/media/${this.props.image.picture}`} alt="Generic placeholder image" width="150" height="150"/>
                    </a>
                    <div className="media-body">
                        <p className="media-heading">{this.props.image.title}
                            <br/>
                            <small> Modified {moment(this.props.image.date_modified).fromNow()}</small>
                        </p>
                    </div>
                </div>
            </div>)


    }
}

class ProgressBar extends React.Component {
    render() {
        if(this.props.isUploading){
        return(
            <div className="progresszone">
            <p>{this.props.filename}</p>
            <div className="row">
            <div className="col-sm-4">
             <img src={this.props.preview} />
             </div>
             <div className="col-sm-8">
            <progress className="progress progress-striped progress-info" value={this.props.percentage} max="100">{this.props.perecentage}%</progress>
            </div>
            </div>
            </div>
        );
    }
    return(<div />)
    }
}


