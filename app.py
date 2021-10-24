from matplotlib import style
style.use('fivethirtyeight')

import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template
from sqlalchemy import (Column, Float, Integer, MetaData, String, Table,
                        create_engine, func)
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session

#################################################
# Database Setup
# #################################################
engine = create_engine("sqlite:///./resources/sqlite/final_data.sqlite")


def init():
    # because we don't have a primary key in the sqlite we cannot automap it
    # so we need to specify here the primary key

    # After we map the table to class return it
    metadata = MetaData()

    Table('final_data', metadata,
        Column('zipcode', Integer, primary_key=True),
        Column('lat', Float),
        Column('lng', Float),
        Column('state', String),
        Column('city', String),
        Column('avg2019', Float),
        Column('avg2020', Float))

    # we can then produce a set of mappings from this MetaData.
    Base = automap_base(metadata=metadata)

    # calling prepare() just sets up mapped classes and relationships.
    Base.prepare()
    HouseData = Base.classes.final_data
    return HouseData
    

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

@app.route('/')
def db_ping():
    init()
    df = pd.read_sql_table('final_data', engine)

    df.reset_index(inplace=True)
    states = df['state']
    states = list(set(states))
    states.sort()

    return render_template('index.html', statelist=states)
    

# calling this function when changing the state
@app.route('/<state>/data')
def calc_metadata(state):
    HouseData = init()
    session = Session(engine)
    # if year == 2019:
    temps = session.query(func.min(HouseData.avg2019), func.max(HouseData.avg2019), func.avg(HouseData.avg2019)).\
        filter(HouseData.state == state).all()
    temps = list(np.ravel(temps))
    session.close()
    print(temps)
    min = "${:,.0f}".format(temps[0])
    max = "${:,.0f}".format(temps[1])
    avg = "${:,.0f}".format(temps[2])
    temp_dict = {"Min": min, "Max": max, "Avg": avg}
    # display(temp_dict)
    return jsonify(temp_dict)


# calling this function when specify a different year
@app.route('/<state>/<year>/data')
def calc_metadata_year(state, year):
    HouseData = init()
    session = Session(engine)
    temps = None
    if str(year) == '2019':
        temps = session.query(func.min(HouseData.avg2019), func.max(HouseData.avg2019), func.avg(HouseData.avg2019)).\
        filter(HouseData.state == state).all()
    elif str(year) == '2020':
         temps = session.query(func.min(HouseData.avg2020), func.max(HouseData.avg2020), func.avg(HouseData.avg2020)).\
            filter(HouseData.state == state).all()
    temps = list(np.ravel(temps))
    session.close()
    print(temps)
    min = "${:,.0f}".format(temps[0])
    max = "${:,.0f}".format(temps[1])
    avg = "${:,.0f}".format(temps[2])
    temp_dict = {"Min": min, "Max": max, "Avg": avg}
    # display(temp_dict)
    return jsonify(temp_dict)


# calling this function to show all data per state
@app.route('/data/<state>')
def get_data(state):
    HouseData = init()
    session = Session(engine)
    # zipcode = session.query(HouseData.zipcode).group_by(HouseData.state).filter(HouseData.state == state).all()
    # city = session.query(HouseData.city).group_by(HouseData.state).filter(HouseData.state == state).as_scalar() 
    data = session.execute("SELECT * from final_data").fetchall()
    # take all the rows that contain this state
    ret_data = []
    for i in data:
        if i[3] == state:
            ret_data.append(i)

    ret_data = [list(x) for x in ret_data]
    session.close()

    temp_dict = { 
                 "state": [state],
                 "metadata": ret_data,
                 }
    return jsonify(temp_dict)
    # print(temp_dict)


# calling this function to show all data for all states
@app.route('/data')
def get_all_data():
    HouseData = init()
    session = Session(engine)
    # zipcode = session.query(HouseData.zipcode).group_by(HouseData.state).filter(HouseData.state == state).all()
    # city = session.query(HouseData.city).group_by(HouseData.state).filter(HouseData.state == state).as_scalar() 
    data = session.execute("SELECT * from final_data").fetchall()
    # take all the rows that contain this state

    ret_data = [list(x) for x in data]
    session.close()

    return jsonify(ret_data)


if __name__ == '__main__':
    app.run(debug=True)
