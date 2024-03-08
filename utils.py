import base64
import random
import streamlit as st

from fpdf import FPDF
from fpdf.enums import XPos, YPos

problem_types = {
    "Addition": {
        "problem_sign": "+",
        "font_size": 22,
    },
    "Subtraction": {
        "problem_sign": "-",
        "font_size": 22,
    },
    "Multiplication": {
        "problem_sign": "x",
        "font_size": 18,
    },
}


### USER INPUTS ###

def get_user_inputs(problem_types):
    # Collect user inputs from streamlit widgets
    user_problem_type = st.selectbox("Choose a problem type", problem_types)
    first_number_rng = st.slider("Select a range of values for the first number:", 1, 200, (35, 87))
    second_num_max = first_number_rng[0] - 1
    second_num_rng = st.slider("Select a range of values for the second number:", 1, 200, (13, second_num_max))

    user_dict = {
        "problem_type": user_problem_type,
        "problem_sign": problem_types.get(user_problem_type).get("problem_sign"),
        "first_number_rng": first_number_rng,
        "second_number_rng": second_num_rng,
    }

    return user_dict

### CREATE FULL SET OF POSSIBLE PROBLEMS ###

def create_problem_lst(user_dict):
    first_num_rng = range(user_dict.get("first_number_rng")[0], user_dict.get("first_number_rng")[1] + 1)
    second_num_rng = range(user_dict.get("second_number_rng")[0], user_dict.get("second_number_rng")[1] + 1)
    problem_type = user_dict.get("problem_type")
    problem_lst = []
    for f in first_num_rng:
        for s in second_num_rng:
            if f>=s:
                if problem_type=="Addition":
                    problem_lst.append((f+s,f,s))
                elif problem_type=="Multiplication":
                    problem_lst.append((f*s,f,s))
                elif problem_type=="Subtraction":
                    problem_lst.append((f-s,f,s))
                else:
                    problem_lst.append((f+s,f,s))
    return problem_lst

def display_problem_examples(problem_lst, user_dict):
    problem_sign = user_dict.get("problem_sign")
    st.caption("Example problems based on inputs:")
    for prob in range(0,5):
        random_problem = random.choice(problem_lst)
        first_str = str(random_problem[1])
        second_str = str(random_problem[2])
        answer_str = str(random_problem[0])
        test_str =  f"{first_str} {problem_sign} {second_str} = {answer_str}"
        st.write(test_str)

    return True

### ASSIGN LETTER TO PROBLEM ###
def create_answer_dict(user_dict, problem_lst, this_joke):
    answer_dict = {}
    answer_lst = []
    char_count = 0
    for i in this_joke.get('joke_a'):
        if i in ['-',' ']:
            answer_dict[char_count] = [i,False,(0,0,0)]
            char_count+=1
        else:
            answer_unique = False
            counter = 0
            while answer_unique==False and counter<99:
                counter+=1
                problem_rand = random.choice(problem_lst)
                answer_rand = problem_rand[0]
                if not answer_rand in answer_lst:
                    answer_lst.append(answer_rand)
                    counter=0
                    answer_unique = True
                    
            answer_dict[char_count] = [i.upper(),True,problem_rand]
            char_count+=1
    return answer_dict

### FPDF Cell Creation Helpers ###

def create_cell_end_of_row(pdf, width, height, text):
    return pdf.cell(
        w=width,
        h=height,
        txt=text,
        border=0,
        new_x=XPos.LMARGIN, 
        new_y=YPos.NEXT, 
        align="L"
    )

def create_empty_cell_end_of_row(pdf, h):
    return create_cell_end_of_row(pdf, width=1, height=h, text="")

def create_complete_empty_spacer_row(pdf, w, h):
    return create_cell_end_of_row(pdf, width=w, height=h, text="")

def create_single_spacer_cell(pdf, width, height):
    return pdf.cell(
        w=width,
        h=height,
        txt="",
        border=0,
        new_x=XPos.RIGHT, 
        new_y=YPos.TOP, 
        align="C"
    )


def create_pdf_file(this_joke, answer_dict, user_dict):
    problem_sign = user_dict.get("problem_sign")
    font_size = 18
    ### answer_dict is a dictonary of lists - each list has three elements
    ### 1st element - Letter character that corresponds with the letters in the joke answer
    ### 2nd element - Boolean, True==Alphabetical Character with an associate math clue, False==Space or Dash, no math clue
    ### 3rd element - Tuple with (answer, first number, second number)

    ### doc fpdf.cell(w, h=0, txt="", border=0, 
    ###                  ln=0, align="", fill=False, link="")
    ### border options - 0:none, 1:frame, L:left, T:top, R:right, B:bottom
    ### ln options (deprecated) 
    ### 0:to the right --> new_x=XPos.RIGHT, new_y=YPos.TOP
    ### 1:to the beginning of the next line --> new_x=XPos.LMARGIN, new_y=YPos.NEXT
    ### 2:below --> new_x = XPos.LEFT, new_y = YPos.NEXT  

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Times", "", font_size)

    h = 15 # row height 
    # cell width of answer row
    if len(answer_dict) < 8:
        w = 14
    elif len(answer_dict) < 12:
        w = 12
    else:
        w = 10

    ### print joke question in first cell at the top, then return to beginning of next line
    # pdf.cell(100, h, this_joke.get("joke_q"), border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="L")
    create_cell_end_of_row(
        pdf=pdf,
        width=100,
        height=h,
        text=this_joke.get("joke_q")
    )

    ### print spacer row where letters will be written for the answer, add dashes where necessary
    for a in answer_dict:
        this_char = answer_dict.get(a)
        if this_char[1]==False:
            pdf.cell(w, h, str(this_char[0]), border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align="C")
        else:
            pdf.cell(w, h, '', border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align="L")

        # pad with an empty cell between each letter, with width=5
        create_single_spacer_cell(pdf, width=5, height=h)
    
    create_empty_cell_end_of_row(pdf, h)
            
    ### print row with all the number solutions, using a Top border
    for a in answer_dict:
        this_char = answer_dict.get(a)
        if this_char[1]==True:
            pdf.cell(w, h, str(this_char[2][0]), "T", new_x=XPos.RIGHT, new_y=YPos.TOP, align="C")
        else:
            # pdf.cell(w, h, '', border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align="C")
            create_single_spacer_cell(pdf, w, h)

        # pad with an empty cell between each letter, with width=5
        create_single_spacer_cell(pdf, width=5, height=h)
        
    create_empty_cell_end_of_row(pdf, h)

    ### spacer row
    # pdf.cell(100, h*2, '', border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="L")
    create_complete_empty_spacer_row(pdf, 100, h*2)

    while len(answer_dict)>0:
        ### each problem row is a matrix of 4 columns by 3 rows
        this_problem_row = []
        this_problem_row_answers = []
        while len(this_problem_row)<4 and len(answer_dict)>0:
            k = random.choice(list(answer_dict.keys()))
            if answer_dict.get(k)[1]==False:
                del answer_dict[k]
            else:
                this_problem_row.append(answer_dict.get(k)[2])
                this_problem_row_answers.append(answer_dict.get(k)[0])
                del answer_dict[k]
        
        print(str(this_problem_row))
        row_1 = []
        row_2 = []
        for t in this_problem_row:
            row_1.append(str(t[1]))
            row_2.append(str(t[2]))

        ### print four columns for first row of this problem row
        count = 0
        for r1 in row_1:
            pdf.cell(25, h, r1, border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align="R")
            count+=1
            if count>=len(row_1):
                new_x=XPos.LMARGIN
                new_y=YPos.NEXT
            else:
                new_x=XPos.RIGHT
                new_y=YPos.TOP
            
            pdf.cell(20, h, "", border=0, new_x=new_x, new_y=new_y, align="R")
            
        ### print four columns for first row of this problem row
        count = 0

        for r2 in row_2:
            pdf.cell(25, h, problem_sign+' '+r2, border='B', new_x=XPos.RIGHT, new_y=YPos.TOP, align="R")
            count+=1
            if count>=len(row_2):
                new_x=XPos.LMARGIN
                new_y=YPos.NEXT
            else:
                new_x=XPos.RIGHT
                new_y=YPos.TOP
            pdf.cell(20, h, "", border=0, new_x=new_x, new_y=new_y, align="R")
            
        ### print spacer rows with letter codes
        count = 0
        for r3 in this_problem_row_answers:
            pdf.cell(25, h, "", border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align="R")
            count+=1
            if count>=4:
                new_x=XPos.LMARGIN
                new_y=YPos.NEXT
            else:
                new_x=XPos.RIGHT
                new_y=YPos.TOP
            pdf.cell(20, h, str(r3), border=0, new_x=new_x, new_y=new_y, align="L")   
            
        ### print blank spacer rows
        count = 0
        for r4 in range(0,4):
            pdf.cell(20, h, "", border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align="R")
            count+=1
            if count>=4:
                new_x=XPos.LMARGIN
                new_y=YPos.NEXT
            else:
                new_x=XPos.RIGHT
                new_y=YPos.TOP
            pdf.cell(20, h, "", border=0, new_x=new_x, new_y=new_y, align="R") 
    return pdf

def display_pdf(file):
    base64_pdf = file
    # Opening file from file path
    with open(file, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')

    # Embedding PDF in HTML
    pdf_display = F'<iframe src="data:application/pdf;base64,{base64_pdf}" width="700" height="1000" type="application/pdf"></iframe>' 
    # Displaying File
    st.markdown(pdf_display, unsafe_allow_html=True)

    return True
