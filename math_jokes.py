from utils import *
from jokes import *

st.set_page_config(
    page_title="Math Jokes",
    page_icon="chart_with_upwards_trend",
    layout="wide",
)

st.title("Math Jokes Worksheet")

def execute_pdf(jokes, user_dict):
    this_joke = random.choice(jokes)
    print(this_joke)
    answer_dict = create_answer_dict(user_dict, problem_lst, this_joke)
    this_pdf = create_pdf_file(this_joke, answer_dict, user_dict)

    filename = "math_jokes_" + this_joke.get("filename") + ".pdf"
    this_pdf.output(filename)
    with open(filename, "rb") as f:
        st.download_button("Download pdf", f, filename)

    # display_pdf(filename)

    # st.download_button(
    #     label="Download PDF",
    #     data=this_pdf.output(filename),
    #     file_name=filename,
    #     mime="application/pdf",
    # )

    return True

# User Inputs
user_dict = get_user_inputs(problem_types)

# Create possible problems based on User Inputs
problem_lst = create_problem_lst(user_dict)

# Display example problems
display_problem_examples(problem_lst, user_dict)

# Generate PDF
if st.button("Create PDF"):
    execute_pdf(jokes, user_dict)





    

    
