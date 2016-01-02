import React from 'react';
import Slider from 'react-slick';
import classNames from 'classnames';
import _ from 'lodash';
const fbId = document.querySelector("meta[name='fb-id']").getAttribute('content');

export default class EditableDiv extends React.Component{

    render(){
        return(
            <div>
            <ImageDiv image={this.props.image} editImage={this.props.editImage} 
            deleteImage={this.props.deleteImage}
            updateImage={this.props.updateImage}
            />
            <FilterDiv image={this.props.image} changeFilter={this.props.updateImage}/>
            </div>
            );
    }
}


class ImageDiv extends React.Component{
    
    componentWillMount() {
        this.setState({editMode: false});

          
    }
    componentWillUpdate(nextProps, nextState) {
        if(this.props.image.picture !== nextProps.image.picture){
            if(this.state.editMode) this.props.updateImage(this.props.image);
            this.setState({editMode: false}); 
        }
          
    }
    toggleEdit(e){
        e.preventDefault();
        if(this.state.editMode) this.props.updateImage(this.props.image);
        this.setState({editMode: !this.state.editMode});
    }
    changeTitle(e){
        e.preventDefault();
        let image_copy = _.clone(this.props.image);
        image_copy.title = e.target.value;
        this.props.editImage(image_copy);
    }
    deleteImage(e){
        e.preventDefault();
        if(!confirm("are you sure you want to delete this image")) return; 
        this.props.deleteImage(this.props.image);
    }
    resetImage(){
        if(!confirm("are you sure you want to reset the filters")) return;
        let image_copy = _.clone(this.props.image);
        image_copy['filtered'] = false;
        console.log(image_copy)
        this.props.updateImage(image_copy);
    }

    render(){
        var buttonClass = classNames({
                'btn':true,
                'disabled': !_.isObject(this.props.image)
            });
        let picture = this.props.image.filtered? this.props.image.filter_path: this.props.image.picture
        return(
            <div>
            <div className="card text-xs-center">
                <blockquote className="card-blockquote card-text">
                    <form className={`${!this.state.editMode ? 'hide':''} form-inline`} action="#" onSubmit={this.toggleEdit.bind(this)}>
                      <div className="form-group">
                        <div className="input-group">
                          <input type="text" ref="title"  className="form-control" value={this.props.image.title} onChange={this.changeTitle.bind(this)}
                          />
                          </div>
                        </div>
                      <button type="submit" className="btn btn-default">Save</button>
                    </form>
                  <h6 className={`${this.state.editMode ? 'hide':''} text-uppercase`}>{_.isObject(this.props.image)?  (this.props.image.title || 'No Name'): 'No Image Selected'} </h6>
                  <h6 className="text-uppercase">{_.isObject(this.props.image)?  (this.props.image.current_filter || 'No Filter Applied'): ''} </h6>
                </blockquote>

            </div>
            <div className="edit-buttons">
            <button className={buttonClass} onClick={_.isObject(this.props.image)? this.toggleEdit.bind(this):''}><span className="mdi mdi-pencil"></span></button>
            <button className={buttonClass} onClick={_.isObject(this.props.image)? this.deleteImage.bind(this): ''}><span className="mdi mdi-delete"></span></button>
            <button className={buttonClass} onClick={_.isObject(this.props.image)? this.resetImage.bind(this): ''}><span className="mdi mdi-backup-restore"></span></button>

            <button className={`${buttonClass} pull-sm-right`}><span className="mdi mdi-share-variant"></span></button>
            <button className={`${buttonClass} pull-sm-right`}><span className="mdi mdi-download"></span></button></div>
            <div className="edit text-center">
            <img ref="filtedimage" src={this.props.image.picture? `/media/${picture}?${Math.random().toString(36).slice(2)}`:''} />
            </div>
            </div>
            );
    }
}
class FilterDiv extends React.Component{

    activateFilter(filter){
        if(filter != this.props.image.current_filter){
            let image = _.clone(this.props.image)
            image['filtered'] = true;
            image['current_filter'] = filter
            this.props.changeFilter(image, filter);
        }
    }
    
    _createFilterDiv(filter,i){
        var activeFilter = classNames({
                'active': this.props.image.current_filter == filter
            });
            return (
                <div className={`${activeFilter} ${filter}`} key={i} onClick={this.activateFilter.bind(this,filter)}>
                <img src={`/media/${this.props.image.picture}`} width="100" height="100"/>
                <p className="lead">{filter}</p>
                </div>
                );
        }

    render(){
        let filters = ['BLUR', 'CONTOUR', 'DETAIL','EDGE_ENHANCE','EDGE_ENHANCE_MORE','EMBOSS','FIND_EDGES','SMOOTH'];
        var settings = {
            className:'slider',
            infinite: false,
            speed: 500,
            slidesToShow: 5,
            slidesToScroll: 5,
            arrows:true
        };
        if (this.props.image){
        return(
            
             <Slider {...settings}>
             {filters.map(this._createFilterDiv.bind(this))}
            </Slider>
            );
    }
    else{
        return(<div />)
    }

    }
}

